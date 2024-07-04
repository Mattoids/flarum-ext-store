<?php

namespace Mattoid\Store\Event;

use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

class StoreInvalidEvent
{
    public $cart;
    public $store;
    public $status;

    /**
     * @param StoreModel $store
     * @param StoreCartModel $cart
     * @param $status               // 购买状态 true-成功 false-失败
     */
    public function __construct(StoreModel $store, StoreCartModel $cart, $status)
    {
        $this->cart = $cart;
        $this->store = $store;
        $this->status = $status;
    }
}
