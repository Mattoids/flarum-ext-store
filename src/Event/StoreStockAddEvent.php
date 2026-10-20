<?php

namespace Mattoid\Store\Event;

use Mattoid\Store\Model\StoreModel;

/**
 * 事件 payload 为只读契约：监听者不得修改属性，结构变更需视为 BC 破坏
 */
class StoreStockAddEvent
{
    public $store;

    public function __construct(StoreModel $store)
    {
        $this->store = $store;
    }
}
