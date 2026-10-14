<?php

namespace Mattoid\Store\Model;

use Flarum\Database\AbstractModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreModel extends AbstractModel
{
    use SoftDeletes;

    protected $table = "store";

    /** 开启 Eloquent 自动时间戳（UTC） */
    public $timestamps = true;

    /** 无限库存标记值 */
    const STOCK_UNLIMITED = -99;

    protected $fillable = [
        'code', 'title', 'class_name', 'price', 'stock',
        'discount', 'discount_limit', 'discount_limit_unit', 'discount_price', 'discount_start_at',
        'type', 'status', 'outtime', 'icon', 'hide', 'repeat', 'desc', 'pop_up',
        'auto_deduction', 'use_type', 'subtype', 'group',
    ];

    protected $dates = ['discount_start_at'];

    protected $casts = [
        'price' => 'float',
        'discount_price' => 'float',
    ];
}
