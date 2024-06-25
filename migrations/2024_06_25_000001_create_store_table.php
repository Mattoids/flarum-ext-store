<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store',
    function (Blueprint $table) {
        $table->increments('id');
        $table->string('code')->comment("商品类型")->unique();
        $table->string('name')->comment("商品名称");
        $table->string('uri')->comment("处理接口");
        $table->text('pop_up')->comment("弹窗信息（json字符串）");
        $table->timestamps();
    }
);

