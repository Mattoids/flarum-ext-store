<?php

namespace Mattoid\Store\Goods;

use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 商品 失效/过期 时调用
 * Call when product expires/expires
 */
abstract class Invalid
{
    /**
     * 商品 失效/过期 时调用
     * Call when product expires/expires
     *
     * @param StoreModel $store 商品信息  commodity information
     * @param StoreCartModel $cart  购物车信息  Shopping Cart Information
     *
     * @return boolean 返回 true-success false-fail
     */
    abstract static function invalid(StoreModel $store, StoreCartModel $cart);
}
