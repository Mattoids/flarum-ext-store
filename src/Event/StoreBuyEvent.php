<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 事件 payload 为只读契约：监听者不得修改属性，结构变更需视为 BC 破坏
 */
class StoreBuyEvent
{
    public $user;
    public $cart;
    public $store;
    public $params;

    public function __construct(User $user, StoreModel $store, StoreCartModel $cart, $params)
    {
        $this->user = $user;
        $this->cart = $cart;
        $this->store = $store;
        $this->params = $params;
    }
}
