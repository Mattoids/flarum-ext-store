<?php

namespace Mattoid\Store\Listeners;

use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 编辑购物车
 * Edit Cart
 */
class StoreCartEditListeners
{
    private $events;

    public function __construct(Dispatcher $events)
    {
        $this->events = $events;
    }

    public function handle(StoreCartEditEvent $event) {
        // 更新购物车状态
        // Update shopping cart status
        $cart = StoreCartModel::query()->where('id', $event->cart->id)->first();
        if (!$cart) {
            return null;
        }
        $cart->status = $event->cart->status;
        $cart->save();

        // 购买失败（status=2）则回滚库存
        // Roll back inventory if purchase fails
        if ($event->cart->status == 2) {
            $store = StoreModel::query()->where('id', $event->cart->store_id)->first();
            if ($store) {
                $this->events->dispatch(new StoreStockAddEvent($store));
            }
        }

        return $cart;
    }

}
