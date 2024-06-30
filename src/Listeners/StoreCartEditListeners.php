<?php

namespace Mattoid\Store\Listeners;

use Mattoid\Store\Event\StoreCartAddEvent;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

class StoreCartEditListeners
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

    public function handle(StoreCartEditEvent $event) {
        $cart = StoreCartModel::query()->where('id', $event->cart->id)->first();
        $cart->status = $event->cart->status;
        $cart->save();

        // 购买失败则回滚库存
        if ($event->cart->status > 1) {
            $store = StoreModel::query()->where('id', $event->cart->store_id)->first();
            $this->events->dispatch(new StoreStockAddEvent($store));
        }

        return $cart;
    }

}
