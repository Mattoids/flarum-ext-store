<?php

namespace Mattoid\Store\Listeners;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Mattoid\Store\Event\StoreStockSubEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 减少库存
 * 无限库存（-99 < 0）天然被 stock > 0 条件排除，条件 UPDATE 原子扣减，防并发超卖
 */
class StoreStockSubListeners
{
    private $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    public function handle(StoreStockSubEvent $event) {
        // 无限库存标记值不参与扣减（-99 < 0，会被下方 stock > 0 条件误伤，先短路）
        if ($event->store->stock == StoreModel::STOCK_UNLIMITED) {
            return;
        }

        $affected = StoreModel::query()
            ->where('id', $event->store->id)
            ->where('stock', '>', 0)
            ->decrement('stock');

        if (!$affected) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')]);
        }

        $event->store->stock = $event->store->stock !== null ? $event->store->stock - 1 : null;
    }
}
