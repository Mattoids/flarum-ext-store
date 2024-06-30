<?php

namespace Mattoid\Store\Event;

use Mattoid\Store\Model\StoreCartModel;

class StoreCartEditEvent
{
    public $cart;

    public function __construct(StoreCartModel $cart)
    {
        $this->cart = $cart;
    }
}
