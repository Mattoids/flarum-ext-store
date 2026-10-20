<?php

namespace Mattoid\Store\Event;

use Mattoid\Store\Model\StoreCartModel;

/**
 * 事件 payload 为只读契约：监听者不得修改属性，结构变更需视为 BC 破坏
 */
class StoreCartEditEvent
{
    public $cart;

    public function __construct(StoreCartModel $cart)
    {
        $this->cart = $cart;
    }
}
