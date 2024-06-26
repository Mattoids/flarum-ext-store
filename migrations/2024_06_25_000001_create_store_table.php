<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store',
    function (Blueprint $table) {
        $table->increments('id');
        $table->string('code')->comment("商品类型")->index();
        $table->string('title')->comment("商品名称");
        $table->string('uri')->comment("处理接口");
        $table->decimal('price', 10 ,2)->comment("商品价格");
        $table->integer('stock')->comment("库存数量");
        $table->integer('discount')->comment("折扣(%)");
        $table->integer('discount_limit')->comment("折扣(%)");
        $table->integer('discount_limit_unit')->comment("折扣(%)");
        $table->integer('type')->comment("购买类型");
        $table->integer('outtime')->comment("商品有效期");
        $table->string('icon')->comment("商品图标");
        $table->integer('hide')->comment("无权限时隐藏商品");
        $table->text('desc')->comment("商品描述");
        $table->text('pop_up')->comment("弹窗信息（json字符串）");
        $table->timestamps();
    }
);

