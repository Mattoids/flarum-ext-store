<?php
// Flarum 1.x 不支持 rollback，本迁移不可回滚。

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return [
    'up' => function (Illuminate\Database\Schema\Builder $schema) {
        $schema->create('store_gift_log', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->comment('受赠用户ID')->index();
            $table->integer('from_user_id')->comment('赠送人ID')->index();
            $table->string('from_username')->default('')->comment('赠送时的用户名');
            $table->string('from_display_name')->default('')->comment('赠送时的显示名');
            $table->string('from_avatar_url')->default('')->comment('赠送时的头像地址');
            $table->integer('store_id')->comment('商品ID')->index();
            $table->integer('cart_id')->nullable()->comment('对应购买记录ID');
            $table->string('title')->comment('商品名称');
            $table->integer('amount')->default(1)->comment('赠送数量');
            $table->timestamps();
        });
    },
];
