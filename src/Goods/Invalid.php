<?php

namespace Mattoid\Store\Goods;

use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

abstract class Invalid
{
    abstract static function invalid(StoreModel $store, StoreCartModel $cart);
}
