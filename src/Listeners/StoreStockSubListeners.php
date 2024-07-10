<?php

namespace Mattoid\Store\Listeners;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 减少库存
 * reduce inventory
 */
class StoreStockSubListeners
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

    public function handle(StoreStockSubEvent $event) {
        $store = StoreModel::query()->where('id', $event->store->id)->first();

        if ($store->stock != -99) {
            if ($store->stock < 1) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')]);
            }

            $store->decrement('stock');
        }
    }

}
