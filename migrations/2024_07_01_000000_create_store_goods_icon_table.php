<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store_goods_icon',
    function (Blueprint $table) {
        $table->increments('id');

        $table->char('uuid', 32)->comment('文件唯一编码')->unique();
        $table->string('url')->comment('图片地址');
        $table->integer('count')->comment('使用数量');

        // created_at & updated_at
        $table->timestamps();
    }
);

