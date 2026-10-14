<?php

namespace Mattoid\Store\Listeners;

use Carbon\Carbon;
use Flarum\Locale\Translator;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreCartAddEvent;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Model\StoreCartModel;

/**
 * 添加购物车（同事务内扣库存后落库；created_at/updated_at 由 Eloquent 自动维护）
 */
class StoreCartAddListeners
{
    private $events;
    private $translator;

    public function __construct(Dispatcher $events, Translator $translator)
    {
        $this->events = $events;
        $this->translator = $translator;
    }

    public function handle(StoreCartAddEvent $event) {
        $user = $event->user;
        $store = $event->store;
        $price = $event->price;

        // 创建购物车对象
        $cart = new StoreCartModel();
        $cart->user_id = $user->id;
        $cart->store_id = $store->id;
        $cart->code = $store->code;
        $cart->title = $store->title;
        $cart->price = $store->price;
        $cart->pay_amt = $price;
        $cart->type = $store->type;
        $cart->status = 0;
        $cart->enable = 0;

        if ($store->type == 'limit') {
            $cart->outtime = Carbon::now()->addDays($store->outtime);
        }

        // 先扣除库存，失败则中断且不创建购物车记录
        $this->events->dispatch(new StoreStockSubEvent($store));

        $cart->save();

        return $cart;
    }
}
