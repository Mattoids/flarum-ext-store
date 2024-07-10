<?php

namespace Mattoid\Store\Console\Command;

use Carbon\Carbon;
use Flarum\Console\AbstractCommand;
use Flarum\Foundation\ValidationException;
use Symfony\Contracts\Translation\TranslatorInterface;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Contracts\Cache\Repository;
use Mattoid\Store\Event\StoreInvalidEvent;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 处理失效商品通知逻辑
 */
class GoodsInvalidCommand extends AbstractCommand
{
    protected $events;
    protected $settings;

    public function __construct(SettingsRepositoryInterface $settings, TranslatorInterface $translator, Repository $cache, Dispatcher $events) {
        parent::__construct();
        $this->cache = $cache;
        $this->events = $events;
        $this->settings = $settings;
        $this->translator = $translator;
    }

    protected function configure()
    {
        $this->setName('mattoid:store:check:date')->setDescription('Check the expiration time of the product');
    }

    protected function fire()
    {
        $storeMap = [];
        $dateTime = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));
        $invalidList = StoreCartModel::query()->where('outtime', '<=', $dateTime)->where('type', 'limit')->where('status', 1)->get();
        if (!$invalidList) {
            // 未发现失效商品，跳过处理
            return;
        }

        $storeIdList = array_column(json_decode($invalidList, true), 'store_id');
        $storeList = StoreModel::query()->whereIn('id', $storeIdList)->get();
        foreach ($storeList as $store) {
            $storeMap[$store->id] = $store;
        }

        foreach ($invalidList as $cart) {
            $buyStatus = true;
            // 获取商品信息
            $store = $storeMap[$cart->store_id];
            try {
                // 自动扣费，扣费成功
                $this->autoDeduction($store, $cart);
            } catch (\Exception $e) {
                $buyStatus = false;
                $this->error("[{$cart->code}] {$cart->store_id}:{$cart->id}: {$this->translator->trans('mattoid-store.forum.error.automatic-renewal-fail', ['message' => $e->getMessage()])}");
                try {
                    // 超期商品自动失效
                    $invalid = StoreExtend::getInvalid($cart->code);
                    if ($invalid) {
                        $invalid->invalid($store, $cart);
                    }

                    $cart->status = 2;
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

        $key = md5("{$cart->store_id}-{$cart->user_id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        // 续费不参与折扣，且不处理库存
        $user = User::query()->where('id', $cart->user_id)->first();
        $money = $user->money;
        $balance = $money - $cart->price;
        if ($balance < 0) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        $user->money = $balance;
        $user->where('money', $money);
        if (!$user->save()) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        // 刷新过期时间
        $cart->pay_amt = $cart->price;
        $cart->outtime = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'))->addDays($store->outtime);
        $cart->created_at = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));
        $cart->save();

        // 通知资金消费记录插件
        if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
            $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, -$cart->price, 'AUTODEDUCTION', $this->translator->trans("mattoid-store.forum.auto-deduction", ['title' => $store->title]), ''));
        }

        $this->cache->delete($key);
    }
}
