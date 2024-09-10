<?php

namespace Mattoid\Store\Listeners;

use Carbon\Carbon;
use Mattoid\Store\Event\StoreCartAddEvent;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;

/**
 * 添加购物车
 * Add shopping cart
 */
class StoreCartAddListeners
{

    private $events;
    private $settings;
    private $translator;

    private $storeTimezone = 'Asia/Shanghai';


    public function __construct(Dispatcher $events, SettingsRepositoryInterface $settings, Translator $translator)
    {
        $this->events = $events;
        $this->settings = $settings;
        $this->translator = $translator;

        $storeTimezone = $this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai');
        $this->storeTimezone = !!$storeTimezone ? $storeTimezone : 'Asia/Shanghai';    }

    public function handle(StoreCartAddEvent $event) {
        $actor = $event->user;
        $store = $event->store;
        $price = $event->price;

        // 创建购物车对象
        // Create shopping cart object
        $cart = new StoreCartModel();
        $cart->user_id = $actor->id;
        $cart->store_id = $store->id;
        $cart->code = $store->code;
        $cart->title = $store->title;
        $cart->price = $store->price;
        $cart->pay_amt = $price;
        $cart->type = $store->type;
        $cart->status = 0;
        $cart->enable = 0;
        $cart->created_at = Carbon::now()->tz($this->storeTimezone);
        $cart->updated_at = Carbon::now()->tz($this->storeTimezone);

        if ($store->type == 'limit') {
            $cart->outtime = Carbon::now()->tz($this->storeTimezone)->addDays($store->outtime);
        }

        $cart->save();

        // 通知扣除库存事件
        // Notification of inventory deduction events
        $this->events->dispatch(new StoreStockSubEvent($store));

        return $cart;
    }

}
