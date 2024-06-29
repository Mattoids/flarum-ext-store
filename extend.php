<?php

/*
 * This file is part of mattoid/store.
 *
 * Copyright (c) 2023 mattoid.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Extend;
use Mattoid\Store\Attributes\UserAttributes;
use Mattoid\Store\Controller\BuyGoodsController;
use Mattoid\Store\Controller\DeleteStoreController;
use Mattoid\Store\Controller\ListGoodsController;
use Mattoid\Store\Controller\ListStoreController;
use Mattoid\Store\Controller\PostStoreController;
use Mattoid\Store\Controller\PutStoreController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        ->route('/store', 'mattoid-store.forum.tital'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),
    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Routes('api'))
        ->get('/store/list', 'store.list', ListStoreController::class)
        ->get('/store/goods', 'store.goods.list', ListGoodsController::class)
        ->put('/store/goods', 'store.goods.put', PutStoreController::class)
        ->delete('/store/goods', 'store.goods.delete', DeleteStoreController::class)
        ->post('/store/buy/goods', 'store.buy.goods', BuyGoodsController::class)
        ->post('/store/goods', 'store.goods.post', PostStoreController::class),

    (new Extend\Settings())
        ->serializeToForum('storeName', 'mattoid-store.storeName'),

    (new Extend\ApiSerializer(BasicUserSerializer::class))
        ->attributes(UserAttributes::class),

];
