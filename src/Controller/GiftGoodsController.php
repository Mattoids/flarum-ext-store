<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\Notification\NotificationSyncer;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Mattoid\Store\Event\StoreBuyEvent;
use Mattoid\Store\Event\StoreCartAddEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreGiftLogModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Notification\StoreNotificationBlueprint;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;

/**
 * 赠送商品（管理员）
 * Gift goods to users (admin only)
 */
class GiftGoodsController implements RequestHandlerInterface
{
    /** 指定用户模式单次请求的人数上限（防超大事务行锁堆积） */
    const MAX_USERS_PER_REQUEST = 500;

    /** 全体用户模式分批大小 */
    const BATCH_SIZE = 500;

    /** 每人每件赠送数量上限 */
    const MAX_AMOUNT = 99;

    /** 全体用户赠送进度游标缓存键前缀 */
    const GIFT_CURSOR_PREFIX = 'mattoid-store-gift-all-';

    protected $events;
    protected $translator;
    protected $connection;
    protected $cache;
    protected $syncer;
    /** @var User 当前操作的管理员（赠送通知的 fromUser） */
    private $operator;
    /** @var mixed 全体模式续传游标（handle 中从请求体读取） */
    private $requestCursor;

    public function __construct(Dispatcher $events, Translator $translator, ConnectionInterface $connection, Repository $cache, NotificationSyncer $syncer)
    {
        $this->events = $events;
        $this->translator = $translator;
        $this->connection = $connection;
        $this->cache = $cache;
        $this->syncer = $syncer;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertPermission('mattoid-store.group-moderate');
        $this->operator = $actor;

        $params = $request->getParsedBody();
        $storeId = Arr::get($params, 'storeId');
        $userIds = Arr::get($params, 'userIds', []);
        $allUsers = (bool) Arr::get($params, 'allUsers', false);
        $amount = (int) Arr::get($params, 'amount', 1);
        // 赠送时限（天）：-1 = 用商品上架配置（默认）；0 = 不限时（转为永久）；>0 = 指定天数
        $outtimeDays = (int) Arr::get($params, 'outtimeDays', -1);
        // 全体模式的续传游标（前端超时重试时回传）
        $this->requestCursor = Arr::get($params, 'cursor');

        if (!$storeId || $amount < 1 || $amount > self::MAX_AMOUNT) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }
        if ($outtimeDays < -1) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }
        if (!$allUsers && (!is_array($userIds) || count($userIds) === 0)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }
        // 单次指定用户数上限：超大事务会让 store 行锁长时间堆积、超时整单回滚
        if (!$allUsers && count($userIds) > self::MAX_USERS_PER_REQUEST) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.gift-too-many-users', ['count' => self::MAX_USERS_PER_REQUEST])]);
        }

        // 赠送允许选择已下架商品（status=0）；唯一性等其它校验不变
        $store = StoreModel::query()->where('id', $storeId)->first();
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.store-goods-non-existent')]);
        }
        // 管理员赠送不校验 repeat / 限购

        if ($allUsers) {
            return $this->giftToAllUsers($store, $amount, $outtimeDays);
        }
        return $this->giftToUsers($store, array_unique(array_map('intval', $userIds)), $amount, $outtimeDays);
    }

    /**
     * 指定用户赠送：整体一个事务，单件失败仅记录跳过（与全体模式语义一致）
     */
    private function giftToUsers(StoreModel $store, array $userIds, int $amount, int $outtimeDays = -1): ResponseInterface
    {
        $successUsers = 0;
        $successCount = 0;
        $failed = [
            'insufficientStock' => 0,
            'alreadyOwned' => 0,
            'other' => 0,
        ];

        $this->connection->transaction(function () use ($store, $userIds, $amount, $outtimeDays, &$successUsers, &$successCount, &$failed) {
            foreach ($userIds as $userId) {
                $user = User::query()->where('id', $userId)->whereNull('suspended_until')->first();
                if (!$user) {
                    continue;
                }
                // 商品具有唯一性（不允许重复持有）且目标用户已拥有：记录后跳过该用户，继续其他人
                if ($this->isUniqueGoods($store) && $this->hasOwnedGoods($store, $user)) {
                    $failed['alreadyOwned']++;
                    continue;
                }
                try {
                    $lastCart = null;
                    for ($i = 0; $i < $amount; $i++) {
                        $cart = $this->giftOnce($store, $user, $outtimeDays);
                        if ($cart) {
                            $successCount++;
                            $lastCart = $cart;
                        }
                    }
                    $successUsers++;
                    if ($lastCart) {
                        $this->notifyGift($user, $store, $lastCart);
                    }
                } catch (ValidationException $e) {
                    $this->classifyValidationFailure($e, $failed);
                } catch (\Throwable $e) {
                    $failed['other']++;
                }
            }
        });

        return new JsonResponse([
            'successUsers' => $successUsers,
            'successCount' => $successCount,
            'failed' => $failed,
            'finished' => true,
            'nextCursor' => null,
        ]);
    }

    /**
     * 全体用户赠送：按用户分批提交事务，库存不足的单件记录后跳过。
     * 通过持久化游标断点续传：请求超时中断后，前端拿着 nextCursor 重试不会重复赠送
     */
    private function giftToAllUsers(StoreModel $store, int $amount, int $outtimeDays = -1): ResponseInterface
    {
        $successUsers = 0;
        $successCount = 0;
        $failed = [
            'insufficientStock' => 0,
            'alreadyOwned' => 0,
            'other' => 0,
        ];

        // 并发防护：同一商品的全员赠送同时只允许一个请求执行
        $lockKey = self::GIFT_CURSOR_PREFIX."lock-{$store->id}";
        if (!$this->cache->add($lockKey, time(), 1800)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.request-processing')]);
        }

        try {
            $cursorKey = self::GIFT_CURSOR_PREFIX."cursor-{$store->id}";
            // 仅当请求显式传入 cursor 时才续传；不传则视为新一轮赠送，从头开始并清掉旧游标，
            // 避免上次中断的旧游标把新一轮静默劫持成断点续跑
            if ($this->requestCursor !== null && $this->requestCursor !== '') {
                $lastId = (int) $this->requestCursor;
            } else {
                $this->cache->forget($cursorKey);
                $lastId = 0;
            }
            $finished = false;

            while (true) {
                $userIds = User::query()
                    ->where('id', '>', $lastId)
                    ->whereNull('suspended_until')
                    ->orderBy('id')
                    ->limit(self::BATCH_SIZE)
                    ->pluck('id')
                    ->all();

                if (count($userIds) === 0) {
                    $finished = true;
                    break;
                }

                foreach ($userIds as $userId) {
                    // 每个用户处理完即推进游标（含跳过项），批中途超时重试最多重复当前用户
                    $lastId = (int) $userId;
                    $this->cache->put($cursorKey, $lastId, 86400);

                    $user = User::find($userId);
                    if (!$user) {
                        continue;
                    }
                    // 商品具有唯一性且目标用户已拥有：记录后跳过该用户，继续其他人
                    if ($this->isUniqueGoods($store) && $this->hasOwnedGoods($store, $user)) {
                        $failed['alreadyOwned']++;
                        continue;
                    }
                    $userSuccess = 0;
                    $lastCart = null;
                    try {
                        $this->connection->transaction(function () use ($store, $user, $amount, $outtimeDays, &$userSuccess, &$lastCart) {
                            for ($i = 0; $i < $amount; $i++) {
                                $cart = $this->giftOnce($store, $user, $outtimeDays);
                                if ($cart) {
                                    $userSuccess++;
                                    $lastCart = $cart;
                                }
                            }
                        });
                    } catch (ValidationException $e) {
                        $this->classifyValidationFailure($e, $failed);
                    } catch (\Throwable $e) {
                        $failed['other']++;
                    }
                    if ($userSuccess > 0) {
                        $successUsers++;
                        $successCount += $userSuccess;
                        if ($lastCart) {
                            $this->notifyGift($user, $store, $lastCart);
                        }
                    }
                }
            }

            if ($finished) {
                $this->cache->forget($cursorKey);
            }

            return new JsonResponse([
                'successUsers' => $successUsers,
                'successCount' => $successCount,
                'failed' => $failed,
                'finished' => $finished,
                'nextCursor' => $finished ? null : $lastId,
            ]);
        } finally {
            $this->cache->delete($lockKey);
        }
    }

    /**
     * 按 ValidationException 的 message 归类失败计数（库存不足/已拥有/其它），
     * 避免任何 ValidationException 都被误标为 insufficientStock
     */
    private function classifyValidationFailure(ValidationException $e, array &$failed)
    {
        $message = $e->getAttributes()['message'] ?? '';
        if ($message === $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')) {
            $failed['insufficientStock']++;
        } elseif ($message === $this->translator->trans('mattoid-store.forum.error.gift-already-owned')) {
            $failed['alreadyOwned']++;
        } else {
            $failed['other']++;
        }
    }

    /**
     * 赠送成功通知受赠者（每人一次，而非每件一次）
     */
    private function notifyGift(User $user, StoreModel $store, StoreCartModel $cart)
    {
        try {
            $blueprint = new StoreNotificationBlueprint($store, $this->operator, [
                // cartId 使每次赠送的通知唯一：通知系统按 type+from_user+subject+data 去重，
                // 缺少唯一字段时同一商品的赠送只会通知一次
                'cartId' => $cart->id,
                'url' => '/u/'.resolve(\Flarum\Http\SlugManager::class)->forResource(\Flarum\User\User::class)->toSlug($user).'/backpack',
                'message' => $this->translator->trans('mattoid-store.forum.notification.gift-received', ['title' => $store->title]),
            ]);
            $this->syncer->sync($blueprint, [$user]);
        } catch (\Throwable $e) {
            // 通知失败不影响赠送主流程（facade 在 HTTP 环境不可用，用 PSR logger 保证错误可见）
            resolve(\Psr\Log\LoggerInterface::class)->warning('[mattoid-store] 赠送通知发送失败', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'exception' => $e,
            ]);
        }
    }

    /**
     * 商品是否具有唯一性（不允许重复持有）
     */
    private function isUniqueGoods(StoreModel $store): bool
    {
        return $store->repeat == 0;
    }

    /**
     * 目标用户是否已持有该商品（status=1 且未过期，limit 商品过期视为不再持有）
     */
    private function hasOwnedGoods(StoreModel $store, User $user): bool
    {
        return StoreCartModel::query()
            ->where('user_id', $user->id)
            ->where('store_id', $store->id)
            ->where('status', 1)
            ->where(function ($query) {
                $query->whereNull('outtime')->orWhere('outtime', '>', Carbon::now());
            })
            ->exists();
    }

    /**
     * 赠送一件商品：创建购物车记录（同事务扣库存），并触发 StoreBuyEvent 由各商品插件完成发放
     */
    private function giftOnce(StoreModel $store, User $user, int $outtimeDays = -1)
    {
        // 加入购物车 购物车会自动扣除库存（库存不足时监听器抛异常）
        $cartEvent = new StoreCartAddEvent($user, $store, 0);
        $this->events->dispatch($cartEvent);
        $cart = $cartEvent->cart;

        // 赠送时限覆盖（与商品上架类型无关，任何商品可互相转换）：
        //  -1 = 缺省（限时商品用上架配置，永久商品保持永久）
        //   0 = 不限时，受赠商品转为永久（outtime 不参与失效判定，与正常永久购买一致）
        //  >0 = 指定有效期天数，受赠商品转为限时（outtime = now + N 天）
        if ($outtimeDays >= 0) {
            if ($outtimeDays === 0) {
                $cart->type = 'permanent';
            } else {
                $cart->type = 'limit';
                $cart->outtime = Carbon::now()->addDays($outtimeDays);
            }
        }

        // 赠送强制关闭自动续费：受赠者未同意续费，且 pay_amt=0 + auto_deduction=1 会导致到期扣 0 元无限免费续期
        $cart->auto_deduction = 0;

        // ⚠️ 覆盖值必须先落库：后续 StoreCartEditEvent 的监听器按 id 从库里重载记录、
        // 只保存 status，不落库这里的修改会被整体丢弃（时限覆盖与关闭续费曾因此失效）
        $cart->save();

        // 赠送：标记持有中（与购买流程一致，交由购物车编辑监听器落库）
        $cart->status = 1;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 通知其他插件购买完成（商品插件在此发放实际权益）
        $this->events->dispatch(new StoreBuyEvent($user, $store, $cart, []));

        // 赠送记录（获赠视角）：供用户在「赠送记录」页查询自己获得的内容
        StoreGiftLogModel::query()->create([
            'user_id' => $user->id,
            'from_user_id' => $this->operator->id,
            'from_username' => (string) $this->operator->username,
            'from_display_name' => (string) ($this->operator->display_name ?? $this->operator->username),
            'from_avatar_url' => (string) $this->operator->avatar_url,
            'store_id' => $store->id,
            'cart_id' => $cart->id,
            'title' => $store->title,
            'amount' => 1,
        ]);

        return $cart;
    }
}
