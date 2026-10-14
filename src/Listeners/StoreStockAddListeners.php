<?php

namespace Mattoid\Store\Listeners;

use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 增加库存（用于购买失败库存回滚）
 */
class StoreStockAddListeners
{
    public function handle(StoreStockAddEvent $event) {
        $store = StoreModel::query()->where('id', $event->store->id)->first();
        if ($store && $store->stock != StoreModel::STOCK_UNLIMITED) {
            $store->increment('stock');
        }
    }
}
