<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store_goods',
    function (Blueprint $table) {
        $table->string('code')->comment("商品类型")->unique();
        $table->string('name')->comment("商品名称");
        $table->string('class_name')->comment("弹窗样式");
        $table->text('pop_up')->comment("弹窗信息（json字符串）");
        $table->dateTime('created_at') -> comment("创建时间")->index();
    }
);

