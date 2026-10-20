<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Illuminate\Database\Schema\Builder;

/*
 * 背包功能与级联筛选所需的新列：
 * - use_type: 使用方式 permanent=永久道具（使用/取消） consumable=一次性道具（用一次消耗一条购买记录）
 * - subtype: 商品插件自定义的道具类型（插件通过 Goods::$itemTypes 声明），筛选第 2 级用
 */
return [
    'up' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->string('use_type', 20)->default('permanent')->comment('使用方式 permanent/consumable');
            $table->string('subtype', 50)->nullable()->comment('道具类型（插件自定义）');
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('store', function ($table) {
            $table->dropColumn(['use_type', 'subtype']);
        });
    },
];
