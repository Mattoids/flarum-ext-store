<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

class StoreInvalidEvent
{
    public $cart;
    public $store;

    public function __construct(StoreModel $store, StoreCartModel $cart)
    {
        $this->cart = $cart;
        $this->store = $store;
    }
}
