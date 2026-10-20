<?php

namespace Mattoid\Store\Event;

use Flarum\User\User;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 事件 payload 为只读契约：监听者不得修改属性（cart 属性除外——由 StoreCartAddListeners 回写），结构变更需视为 BC 破坏
 */
class StoreCartAddEvent
{
    public $user;
    public $store;
    public $price;

    /** @var StoreCartModel|null 由 StoreCartAddListeners 创建后回写到事件上 */
    public $cart;

    public function __construct(User $user, StoreModel $store, $price)
    {
        $this->user = $user;
        $this->store = $store;
        $this->price = $price;
    }
}
