<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreModel;

class StoreBuyEvent
{
    public $user;
    public $store;
    public $params;

    public function __construct(User $user = null, StoreModel $store, $params)
    {
        $this->user = $user;
        $this->store = $store;
        $this->params = $params;
    }
}
