<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Flarum\Database\Migration;

return Migration::addColumns('store_cart', [
    'enable' => ['integer', 'default' => 0, 'comment' => '支持使用功能 0-否 1-是']
]);
