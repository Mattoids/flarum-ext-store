<?php

namespace Mattoid\Store\Goods;

use Flarum\User\User;

abstract class Validate
{
    /**
     * @param array $params 购买入参
     * @return boolean 返回 true-验证成功 false-验证失败
     */
    abstract static function validate(User $user, $store, $params);
}
