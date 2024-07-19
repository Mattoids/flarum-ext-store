<?php

namespace Mattoid\Store\Goods;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 购买前触发
 * Trigger before purchase
 */
abstract class Enable
{
    /**
     * 购买前置验证
     * Pre purchase verification
     *
     * @param User $user 操作用户   Operating Users
     * @param StoreModel $store 操作用户   Operating Users
     * @param StoreCartModel $cart 购买入参  Purchase ginseng
     *
     * @return boolean 返回 true-success false-fail
     */
    abstract static function enable(User $user, StoreModel $store, StoreCartModel $cart);
}
