<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

/*
 * 2026-10-14 重构迁移：
 *  1. store 表新增 discount_start_at（折扣窗口独立起点，不再用 updated_at）与 deleted_at（软删除）
 *  2. store_cart 表新增 renewed_at（续费时间，不再覆盖 created_at）及复合索引
 *  3. 历史 datetime 数据已从「商店时区」墙钟时间换算为 UTC（代码已统一 UTC 存储/比较，见 up 内注释）
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        // store 表（幂等：列/索引可能因上次失败的部分执行已存在）
        $schema->table('store', function (Blueprint $table) use ($schema) {
            if (!$schema->hasColumn('store', 'discount_start_at')) {
                $table->dateTime('discount_start_at')->nullable()->after('discount_price')->comment('折扣窗口起点');
            }
            if (!$schema->hasColumn('store', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // store_cart 表
        $db = $schema->getConnection();
        $prefix = $db->getTablePrefix();
        $hasIndex = function ($table, $name) use ($db, $prefix) {
            $rows = $db->select(
                'SELECT COUNT(*) AS c FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
                [$db->getDatabaseName(), $prefix.$table, $name]
            );
            return $rows[0]->c > 0;
        };
        $schema->table('store_cart', function (Blueprint $table) use ($schema, $hasIndex) {
            if (!$schema->hasColumn('store_cart', 'renewed_at')) {
                $table->dateTime('renewed_at')->nullable()->after('outtime')->comment('最近一次续费时间');
            }
            if (!$hasIndex('store_cart', 'store_cart_type_status_outtime_index')) {
                $table->index(['type', 'status', 'outtime'], 'store_cart_type_status_outtime_index');
            }
            if (!$hasIndex('store_cart', 'store_cart_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'store_cart_user_id_status_index');
            }
        });

        // 历史数据时区换算说明（2026-10-14）：
        // 原代码以 storeTimezone（默认 Asia/Shanghai）墙钟时间写入 datetime，本次部署时已一次性
        // 将存量数据换算为 UTC（store 表 3 行；store_cart / store_goods / store_goods_icon 均为空表）。
        // 因此迁移中不再内置换算逻辑，避免重复扣减；其他环境升级时如需换算，按注释日期前的一次性脚本执行。
    },

    'down' => function (Builder $schema) {
        $schema->table('store', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('discount_start_at');
        });

        $schema->table('store_cart', function (Blueprint $table) {
            $table->dropIndex('store_cart_type_status_outtime_index');
            $table->dropIndex('store_cart_user_id_status_index');
            $table->dropColumn('renewed_at');
        });
    },
];
