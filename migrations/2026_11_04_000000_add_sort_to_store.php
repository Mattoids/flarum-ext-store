<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Illuminate\Database\Schema\Builder;

/*
 * 商品排序字段：列表按 sort 倒序排列（大值在前），同值按 id 倒序决胜
 */
return [
    'up' => function (Builder $schema) {
        $schema->table('store', function ($table) use ($schema) {
            if (!$schema->hasColumn('store', 'sort')) {
                $table->integer('sort')->default(0)->comment('排序值，列表按此倒序');
            }
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->dropColumn('sort');
        });
    },
];
