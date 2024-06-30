<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreModel;

class StoreCartAddEvent
{
    public $user;
    public $store;
    public $price;

    public function __construct(User $user = null, StoreModel $store, $price)
    {
        $this->user = $user;
        $this->store = $store;
        $this->price = $price;
    }
}
