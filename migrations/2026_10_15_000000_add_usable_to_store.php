<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

/*
 * 2026-10-15 允许使用（进背包）字段：
 *  store 表新增 usable，标记商品是否允许被使用。
 *  只有 usable=1 的商品才出现在用户背包中（可装备/使用）；
 *  新增商品时表单默认值来自商品插件 Goods 抽象类的 $usable 声明。
 */
return [
    'up' => function (Builder $schema) {
        if (!$schema->hasColumn('store', 'usable')) {
            $schema->table('store', function (Blueprint $table) {
                $table->unsignedTinyInteger('usable')->default(0)->after('use_type')->comment('是否允许使用（1=进背包）');
            });
        }
    },
    'down' => function (Builder $schema) {
        if ($schema->hasColumn('store', 'usable')) {
            $schema->table('store', function (Blueprint $table) {
                $table->dropColumn('usable');
            });
        }
    },
];
