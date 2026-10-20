<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Flarum\Database\Migration;

return Migration::addColumns('store', [
    'auto_deduction' => ['integer', 'default' => 0, 'comment' => '自动扣费 0-未开启 1-开启']
]);
