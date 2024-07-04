<?php

use Flarum\Database\Migration;

return Migration::addColumns('store_cart', [
    'auto_deduction' => ['integer', 'default' => 0, 'comment' => '自动扣费 0-未开启 1-开启']
]);
