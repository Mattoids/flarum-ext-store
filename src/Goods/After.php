<?php

namespace Mattoid\Store\Goods;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Model\StoreModel;

abstract class After
{

    abstract static function after(User $user, StoreModel $store, $params);
}
