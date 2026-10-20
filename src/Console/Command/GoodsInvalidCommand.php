<?php

namespace Mattoid\Store\Console\Command;

use Carbon\Carbon;
use Flarum\Console\AbstractCommand;
use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Contracts\Cache\Repository;
use Mattoid\Store\Event\StoreInvalidEvent;
use Mattoid\Store\Exception\RenewalLockException;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Service\StoreMoneyManager;

/**
 * 处理失效商品通知逻辑
 */
class GoodsInvalidCommand extends AbstractCommand
{
    protected $cache;
    protected $events;
    protected $translator;
    protected $money;

    public function __construct(Translator $translator, Repository $cache, Dispatcher $events, StoreMoneyManager $money) {
        parent::__construct();
        $this->cache = $cache;
        $this->events = $events;
        $this->translator = $translator;
        $this->money = $money;
    }

    protected function configure()
    {
        $this->setName('mattoid:store:check:date')->setDescription('Check the expiration time of the product');
    }

    protected function fire()
    {
        $dateTime = Carbon::now();
        // 分块处理，避免过期记录累积后一次性全量加载撑爆内存
        StoreCartModel::query()->where('outtime', '<=', $dateTime)->where('type', 'limit')->where('status', 1)
            ->chunkById(200, function ($invalidList) {
                // 含软删商品：商品被删除后其限时购物车仍须走失效流程，否则永不失效
                $storeList = StoreModel::query()->withTrashed()->whereIn('id', $invalidList->pluck('store_id')->all())->get();
                $storeMap = $storeList->keyBy('id');

                foreach ($invalidList as $cart) {
                    $this->processCart($cart, $storeMap);
                }
            });
    }

    private function processCart(StoreCartModel $cart, $storeMap)
    {
        $buyStatus = true;
        // 获取商品信息
        $store = $storeMap->get($cart->store_id);
        if (!$store) {
            // 商品已物理删除：失效钩子与 StoreInvalidEvent 的签名都要求 StoreModel，
            // 跳过调用，仅将购物车置为失效（9-超时失效），避免永久停留 status=1
            try {
                $cart->status = 9;
                $cart->save();
                $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.invalid-product')}");
            } catch (\Exception $e) {
                $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.goods-invalid-fail', ['message' => $e->getMessage()])}");
            }
            return;
        }

        try {
            // 自动扣费，扣费成功
            $this->autoDeduction($store, $cart);
        } catch (RenewalLockException $e) {
            // 防重锁冲突（如手动执行与定时任务重叠）：不是续费失败，跳过等下一分钟重试
            $this->warn("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.request-processing')}");
            return;
        } catch (\Exception $e) {
            $buyStatus = false;
            $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.automatic-renewal-fail', ['message' => $e->getMessage()])}");
            try {
                // 超期商品自动失效（9-超时失效，区别于 2-购买失败）
                $invalid = StoreExtend::getInvalid($cart->code);
                if ($invalid) {
                    $invalid->invalid($store, $cart);
                }

                $cart->status = 9;
                $cart->save();
            } catch (\Exception $e) {
                $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.goods-invalid-fail', ['message' => $e->getMessage()])}");
            }
        }

        try {
            $this->events->dispatch(new StoreInvalidEvent($store, $cart, $buyStatus));
        } catch (\Exception $e) {
            $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.goods-invalid-event-fail', ['message' => $e->getMessage()])}");
        }
    }

    private function autoDeduction(StoreModel $store, StoreCartModel $cart)
    {
        // 商品未开启自动扣费
        if (!$cart->auto_deduction) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.automatic-renewal')]);
        }

        // 商品下架不支持续费
        if ($store->status != 1) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.invalid-product')]);
        }

        // 有效期非法（老数据/改库）视为不可续费：走失效分支，避免 addDays(0) 后每分钟重复扣款
        if ((int) $store->outtime <= 0) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.automatic-renewal')]);
        }

        // 防重锁冲突不算续费失败（外层捕获后跳过，不触发失效）
        $key = md5("mattoid-store-renew-{$cart->store_id}-{$cart->user_id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new RenewalLockException();
        }

        try {
            // 续费不参与折扣、不处理库存；按购买时实付价（cart.pay_amt 快照）续费，
            // 不随商品现价/折扣变动——实付价锁定为设计意图，保障老用户续费价格稳定
            $user = User::query()->where('id', $cart->user_id)->first();
            if (!$user) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
            }
            // 续费扣款交由资金管理器：优先 checkin-with-history 资金体系，未安装时回退原生 SQL
            $paid = $this->money->pay(
                $user,
                $cart->pay_amt,
                'AUTODEDUCTION',
                'mattoid-store.forum.money-history.auto-deduction',
                ['title' => $store->title],
                $this->translator->trans('mattoid-store.forum.auto-deduction', ['title' => $store->title])
            );
            if (!$paid) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
            }

            // 刷新过期时间与续费时间（保留原始购买时间 created_at 与实付价快照 pay_amt）
            $cart->outtime = Carbon::now()->addDays((int) $store->outtime);
            $cart->renewed_at = Carbon::now();
            $cart->save();
        } finally {
            $this->cache->delete($key);
        }
    }
}
