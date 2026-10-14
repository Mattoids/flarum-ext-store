<?php

namespace Mattoid\Store\Listeners;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 减少库存
 */
class StoreStockSubListeners
{
    private $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    public function handle(StoreStockSubEvent $event) {
        $store = StoreModel::query()->where('id', $event->store->id)->first();
        if (!$store || $store->stock == StoreModel::STOCK_UNLIMITED) {
            return;
        }

        // 原子扣减：仅在库存仍充足时扣减，防止并发超卖
        $affected = StoreModel::query()->where('id', $store->id)->where('stock', '>', 0)->decrement('stock');
        if (!$affected) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')]);
        }
    }
}
