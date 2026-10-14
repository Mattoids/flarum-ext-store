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

/**
 * 处理失效商品通知逻辑
 */
class GoodsInvalidCommand extends AbstractCommand
{
    protected $cache;
    protected $events;
    protected $translator;

    public function __construct(Translator $translator, Repository $cache, Dispatcher $events) {
        parent::__construct();
        $this->cache = $cache;
        $this->events = $events;
        $this->translator = $translator;
    }

    protected function configure()
    {
        $this->setName('mattoid:store:check:date')->setDescription('Check the expiration time of the product');
    }

    protected function fire()
    {
        $dateTime = Carbon::now();
        $invalidList = StoreCartModel::query()->where('outtime', '<=', $dateTime)->where('type', 'limit')->where('status', 1)->get();
        if ($invalidList->isEmpty()) {
            return;
        }

        $storeList = StoreModel::query()->whereIn('id', $invalidList->pluck('store_id')->all())->get();
        $storeMap = $storeList->keyBy('id');

        foreach ($invalidList as $cart) {
            $buyStatus = true;
            // 获取商品信息
            $store = $storeMap->get($cart->store_id);
            if (!$store) {
                $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.invalid-product')}");
                continue;
            }

            try {
                // 自动扣费，扣费成功
                $this->autoDeduction($store, $cart);
            } catch (RenewalLockException $e) {
                // 防重锁冲突（如手动执行与定时任务重叠）：不是续费失败，跳过等下一分钟重试
                $this->warn("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.request-processing')}");
                continue;
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

        // 防重锁冲突不算续费失败（外层捕获后跳过，不触发失效）
        $key = md5("mattoid-store-renew-{$cart->store_id}-{$cart->user_id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new RenewalLockException();
        }

        // 续费不参与折扣、不处理库存，按商品当前价续费
        $user = User::query()->where('id', $cart->user_id)->first();
        if (!$user) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }
        // 原子扣款：仅当余额仍足额时扣减，防止并发透支
        $affected = User::query()->where('id', $user->id)->where('money', '>=', $cart->price)->decrement('money', $cart->price);
        if (!$affected) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }
        $user->money -= $cart->price;

        // 刷新过期时间与续费时间（保留原始购买时间 created_at）
        $cart->pay_amt = $cart->price;
        $cart->outtime = Carbon::now()->addDays($store->outtime);
        $cart->renewed_at = Carbon::now();
        $cart->save();

        // 通知资金消费记录插件
        if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
            $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, -$cart->price, 'AUTODEDUCTION', $this->translator->trans("mattoid-store.forum.auto-deduction", ['title' => $store->title]), ''));
        }

        $this->cache->delete($key);
    }
}
