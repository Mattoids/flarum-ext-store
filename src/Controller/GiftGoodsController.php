<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Mattoid\Store\Event\StoreBuyEvent;
use Mattoid\Store\Event\StoreCartAddEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
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
    /** 全体用户模式分批大小 */
    const BATCH_SIZE = 500;

    /** 每人每件赠送数量上限 */
    const MAX_AMOUNT = 99;

    protected $events;
    protected $translator;
    protected $connection;

    public function __construct(Dispatcher $events, Translator $translator, ConnectionInterface $connection)
    {
        $this->events = $events;
        $this->translator = $translator;
        $this->connection = $connection;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $actor->assertPermission('mattoid-store.group-moderate');

        $params = $request->getParsedBody();
        $storeId = Arr::get($params, 'storeId');
        $userIds = Arr::get($params, 'userIds', []);
        $allUsers = (bool) Arr::get($params, 'allUsers', false);
        $amount = (int) Arr::get($params, 'amount', 1);

        if (!$storeId || $amount < 1 || $amount > self::MAX_AMOUNT) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }
        if (!$allUsers && (!is_array($userIds) || count($userIds) === 0)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        // 赠送允许选择已下架商品（status=0）；唯一性等其它校验不变
        $store = StoreModel::query()->where('id', $storeId)->first();
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.store-goods-non-existent')]);
        }
        // 管理员赠送不校验 repeat / 限购

        if ($allUsers) {
            return $this->giftToAllUsers($store, $amount);
        }
        return $this->giftToUsers($store, array_unique(array_map('intval', $userIds)), $amount);
    }

    /**
     * 指定用户赠送：整体一个事务，任一件失败全部回滚
     */
    private function giftToUsers(StoreModel $store, array $userIds, int $amount): ResponseInterface
    {
        $successUsers = 0;
        $successCount = 0;

        $this->connection->transaction(function () use ($store, $userIds, $amount, &$successUsers, &$successCount) {
            foreach ($userIds as $userId) {
                $user = User::query()->where('id', $userId)->whereNull('suspended_until')->first();
                if (!$user) {
                    continue;
                }
                // 商品具有唯一性（不允许重复持有）且目标用户已拥有时：单人模式直接报错回滚
                if ($this->isUniqueGoods($store) && $this->hasOwnedGoods($store, $user)) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.gift-already-owned', ['title' => $store->title])]);
                }
                for ($i = 0; $i < $amount; $i++) {
                    $cart = $this->giftOnce($store, $user);
                    if ($cart) {
                        $successCount++;
                    }
                }
                $successUsers++;
            }
        });

        return new JsonResponse([
            'successUsers' => $successUsers,
            'successCount' => $successCount,
            'failed' => ['insufficientStock' => 0, 'alreadyOwned' => 0, 'other' => 0],
        ]);
    }

    /**
     * 全体用户赠送：按用户分批提交事务，库存不足的单件记录后跳过
     */
    private function giftToAllUsers(StoreModel $store, int $amount): ResponseInterface
    {
        $successUsers = 0;
        $successCount = 0;
        $failed = [
            'insufficientStock' => 0,
            'alreadyOwned' => 0,
            'other' => 0,
        ];

        $lastId = 0;
        while (true) {
            $userIds = User::query()
                ->where('id', '>', $lastId)
                ->whereNull('suspended_until')
                ->orderBy('id')
                ->limit(self::BATCH_SIZE)
                ->pluck('id')
                ->all();

            if (count($userIds) === 0) {
                break;
            }
            $lastId = end($userIds);

            foreach ($userIds as $userId) {
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
                try {
                    $this->connection->transaction(function () use ($store, $user, $amount, &$userSuccess) {
                        for ($i = 0; $i < $amount; $i++) {
                            $cart = $this->giftOnce($store, $user);
                            if ($cart) {
                                $userSuccess++;
                            }
                        }
                    });
                } catch (ValidationException $e) {
                    // 库存不足：跳过该件，继续后续用户
                    $failed['insufficientStock']++;
                } catch (\Throwable $e) {
                    $failed['other']++;
                }
                if ($userSuccess > 0) {
                    $successUsers++;
                    $successCount += $userSuccess;
                }
            }
        }

        return new JsonResponse([
            'successUsers' => $successUsers,
            'successCount' => $successCount,
            'failed' => $failed,
        ]);
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
    private function giftOnce(StoreModel $store, User $user)
    {
        // 加入购物车 购物车会自动扣除库存（库存不足时监听器抛异常）
        $carts = $this->events->dispatch(new StoreCartAddEvent($user, $store, 0));
        $cart = array_shift($carts);

        // 赠送：标记持有中（与购买流程一致，交由购物车编辑监听器落库）
        $cart->status = 1;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 通知其他插件购买完成（商品插件在此发放实际权益）
        $this->events->dispatch(new StoreBuyEvent($user, $store, $cart, []));

        return $cart;
    }
}
