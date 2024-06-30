<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

class StoreBuyFailEvent
{
    public $user;
    public $cart;
    public $store;
    public $params;

    public function __construct(User $user = null, StoreModel $store, StoreCartModel $cart, $params)
    {
        $this->user = $user;
        $this->cart = $cart;
        $this->store = $store;
        $this->params = $params;
    }
}
