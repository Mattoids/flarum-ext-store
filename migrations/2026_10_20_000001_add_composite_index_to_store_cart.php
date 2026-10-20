<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

/*
 * 2026-10-20 性能迁移：
 *  store_cart 热查询均为 user_id + store_id + status 组合条件
 *  （背包列表 / 限购统计 / 重复购买校验），此前只有单列索引需要回表，
 *  补复合索引 (user_id, store_id, status) 以最左前缀覆盖三条查询
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // 幂等：索引可能因上次失败的部分执行已存在
        $hasIndex = function ($table, $name) use ($schema) {
            $db = $schema->getConnection();
            $prefix = $db->getTablePrefix();
            $rows = $db->select(
                'SELECT COUNT(*) AS c FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
                [$db->getDatabaseName(), $prefix.$table, $name]
            );

            return $rows[0]->c > 0;
        };
        $schema->table('store_cart', function (Blueprint $table) use ($hasIndex) {
            if (! $hasIndex('store_cart', 'store_cart_user_id_store_id_status_index')) {
                $table->index(['user_id', 'store_id', 'status'], 'store_cart_user_id_store_id_status_index');
            }
        });
    },
];
