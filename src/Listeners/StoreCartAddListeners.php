<?php

namespace Mattoid\Store\Listeners;

use Carbon\Carbon;
use Mattoid\Store\Event\StoreCartAddEvent;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Model\StoreCartModel;

class StoreCartAddListeners
{

    private $events;
    private $settings;
    private $translator;


    public function __construct(Dispatcher $events, SettingsRepositoryInterface $settings, Translator $translator)
    {
        $this->events = $events;
        $this->settings = $settings;
        $this->translator = $translator;
    }

    public function handle(StoreCartAddEvent $event) {
        $actor = $event->user;
        $store = $event->store;
        $price = $event->price;

        $cart = new StoreCartModel();
        $cart->user_id = $actor->id;
        $cart->store_id = $store->id;
        $cart->code = $store->code;
        $cart->title = $store->title;
        $cart->price = $store->price;
        $cart->pay_amt = $price;
        $cart->type = $store->type;
        $cart->status = 0;
        $cart->created_at = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));
        $cart->updated_at = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));

        if ($store->type == 'limit') {
            $cart->outtime = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'))->addDays($store->outtime);
        }
        $cart->save();

        // 添加购物车同时减库存
        $this->events->dispatch(new StoreStockSubEvent($store));

        return $cart;
    }

}
