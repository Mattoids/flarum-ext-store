<?php

namespace Mattoid\Store\Model;

use Flarum\Database\AbstractModel;

class StoreCartModel extends AbstractModel
{
    protected $table = "store_cart";

    /** 开启 Eloquent 自动时间戳（UTC） */
    public $timestamps = true;

    protected $fillable = [
        'user_id', 'store_id', 'code', 'title', 'price', 'pay_amt',
        'type', 'outtime', 'status', 'enable', 'auto_deduction',
    ];

    protected $dates = ['outtime', 'renewed_at'];

    protected $casts = [
        'price' => 'float',
        'pay_amt' => 'float',
    ];
}
