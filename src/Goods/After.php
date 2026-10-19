<?php

namespace Mattoid\Store\Goods;

use Flarum\User\User;
use Mattoid\Store\Model\StoreModel;

abstract class After
{
    /**
     * 购买后执行
     * Execute after purchase
     *
     * @param User $user 操作用户   Operating Users
     * @param StoreModel $store 操作用户   Operating Users
     * @param array $params 购买入参  Purchase ginseng
     *
     * @return boolean 返回 true-success false-fail
     */
    abstract static function after(User $user, StoreModel $store, $params);
}
