<?php

namespace Mattoid\Store\Goods;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Mattoid\Store\Model\StoreModel;

abstract class After
{

    abstract static function after(User $user, StoreModel $store, $params, Translator $translator = null, SettingsRepositoryInterface $settings = null);
}
