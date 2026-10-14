<?php

use Illuminate\Database\Schema\Builder;

/*
 * 商品分组：store.group 为空时回退到商品插件声明的分组（Goods::$group），
 * 用于商店筛选最前一级「分组」维度。
 */
return [
    'up' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->string('group', 50)->nullable()->comment('商品分组（空=继承插件分组）');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->dropColumn('group');
        });
    },
];
