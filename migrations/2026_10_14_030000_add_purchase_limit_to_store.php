<?php

/*
 * 2026-10-14 限购功能迁移：
 *  store 表新增限购配置（purchase_limit_*），用于「某个商品多长时间内限购多少个」。
 *  purchase_limit_enable         是否开启限购（0/1）
 *  purchase_limit_count          每周期限购数量（0 表示不限制数量）
 *  purchase_limit_period         周期数值
 *  purchase_limit_period_unit    周期单位（days/hour/minute/second，复用 LimitUnitEnum）
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('store', function (Blueprint $table) use ($schema) {
            if (!$schema->hasColumn('store', 'purchase_limit_enable')) {
                $table->unsignedTinyInteger('purchase_limit_enable')->default(0)->after('group')->comment('是否开启限购');
            }
            if (!$schema->hasColumn('store', 'purchase_limit_count')) {
                $table->unsignedInteger('purchase_limit_count')->default(0)->after('purchase_limit_enable')->comment('每周期限购数量');
            }
            if (!$schema->hasColumn('store', 'purchase_limit_period')) {
                $table->unsignedInteger('purchase_limit_period')->default(0)->after('purchase_limit_count')->comment('限购周期数值');
            }
            if (!$schema->hasColumn('store', 'purchase_limit_period_unit')) {
                $table->string('purchase_limit_period_unit', 16)->default('days')->after('purchase_limit_period')->comment('限购周期单位');
            }
        });
    },

    'down' => function (Builder $schema) {
        $schema->table('store', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_limit_enable',
                'purchase_limit_count',
                'purchase_limit_period',
                'purchase_limit_period_unit',
            ]);
        });
    },
];
