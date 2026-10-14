<?php

use Illuminate\Database\Schema\Builder;

/*
 * 修复折扣金额精度：discount_price 原为 int 列，两位小数的折扣价
 * （如 99 元 85 折 = 84.15）在非严格模式下被 MySQL 静默截断为 84，
 * 导致实际收款金额与折扣价不符。改为 decimal(10,2)。
 *
 * 注意：Flarum 未注册 Laravel facades，schema builder 由 Migrator 注入。
 */
return [
    'up' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->decimal('discount_price', 10, 2)->comment('折扣金额')->change();
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->integer('discount_price')->comment('折扣金额')->change();
        });
    },
];
