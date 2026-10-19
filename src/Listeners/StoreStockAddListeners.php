<?php

namespace Mattoid\Store\Listeners;

use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Model\StoreModel;

/**
 * 增加库存（用于购买失败库存回滚）
 * 无限库存（-99）不参与增减，条件 UPDATE 一步完成，无需先查询
 */
class StoreStockAddListeners
{
    public function handle(StoreStockAddEvent $event) {
        StoreModel::query()
            ->where('id', $event->store->id)
            ->where('stock', '!=', StoreModel::STOCK_UNLIMITED)
            ->increment('stock');
    }
}
