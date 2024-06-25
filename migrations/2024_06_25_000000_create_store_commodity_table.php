<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'store_commodity',
    function (Blueprint $table) {
        $table->string('code')->comment("商品类型")->unique();
        $table->string('name')->comment("商品名称");
        $table->string('uri')->comment("处理接口");
        $table->text('pop_up')->comment("弹窗信息（json字符串）");
        $table->dateTime('create_time') -> comment("创建时间")->index();
    }
);

