<?php

namespace Mattoid\Store\Model;

use Flarum\Database\AbstractModel;

class StoreGoodsIconModel extends AbstractModel
{
    protected $table = "store_goods_icon";

    /** 开启 Eloquent 自动时间戳（UTC） */
    public $timestamps = true;

    protected $fillable = ['uuid', 'url', 'count'];
}
