<?php

/*
 * This file is part of mattoid/store.
 *
 * Copyright (c) 2023 mattoid.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

use Flarum\Extend;
use Mattoid\Store\Controller\DeleteStoreController;
use Mattoid\Store\Controller\ListCommodityController;
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
        ->get('/store/commodity', 'store.commodity.list', ListCommodityController::class)
        ->put('/store/commodity', 'store.commodity.put', PutStoreController::class)
        ->delete('/store/commodity', 'store.commodity.delete', DeleteStoreController::class)
        ->post('/store/commodity', 'store.commodity.post', PostStoreController::class),

    (new Extend\Settings())
        ->serializeToForum('storeName', 'mattoid-store.storeName'),

];
