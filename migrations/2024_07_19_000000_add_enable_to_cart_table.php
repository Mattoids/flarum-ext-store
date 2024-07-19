<?php

use Flarum\Database\Migration;

return Migration::addColumns('store_cart', [
    'enable' => ['integer', 'default' => 0, 'comment' => '支持使用功能 0-否 1-是']
]);
