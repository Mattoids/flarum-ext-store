<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store_cart',
    function (Blueprint $table) {
        $table->increments('id');

        $table->integer('user_id')->comment('用户ID')->index();
        $table->integer('store_id')->comment('商品ID')->index();
        $table->string('code')->comment("商品类型");
        $table->string('title')->comment("商品名称");
        $table->decimal('price', 10 ,2)->comment("商品价格");
        $table->decimal('pay_amt', 10 ,2)->comment("支付金额");
        $table->integer('type')->default(0)->comment("购买类型 0-永久有效 1-限时有效");
        $table->dateTime('outtime') -> comment("商品到期时间")->index();
        $table->integer('status')->default(0)->comment('状态 0-未支付 1-已支付 2-已失效 9-超时失效');

        // created_at & updated_at
        $table->timestamps();
    }
);

