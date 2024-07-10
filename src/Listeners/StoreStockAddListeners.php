<?php

namespace Mattoid\Store\Listeners;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 增加库存（用于购买失败库存回滚）
 * Increase inventory (for rolling back failed inventory purchases)
 */
class StoreStockAddListeners
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

    public function handle(StoreStockAddEvent $event) {
        $store = StoreModel::query()->where('id', $event->store->id)->first();
        if ($store->stock != -99) {
            $store->increment('stock');
        }
    }
}
