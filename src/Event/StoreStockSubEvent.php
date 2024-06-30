<?php

namespace Mattoid\Store\Event;

use Mattoid\Store\Model\StoreModel;

class StoreStockSubEvent
{
    public $store;

    public function __construct(StoreModel $store)
    {
        $this->store = $store;
    }
}
