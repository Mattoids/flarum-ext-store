<?php

namespace Mattoid\Store\Goods;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Model\StoreModel;

abstract class Validate
{
    /**
     * @param array $params 购买入参
     * @return boolean 返回 true-验证成功 false-验证失败
     */
    abstract static function validate(User $user, StoreModel $store, $params, Translator $translator = null, SettingsRepositoryInterface $settings = null, Dispatcher $events = null, CacheContract $cache = null);
}
