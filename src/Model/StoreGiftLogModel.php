<?php

namespace Mattoid\Store\Model;

use Flarum\Database\AbstractModel;

/**
 * 赠送记录（获赠视角）
 *
 * 管理员向用户赠送商品时写入，供用户在「赠送记录」页查询自己获得的内容。
 * 赠送人信息在写入时快照，不受后续资料修改影响。
 */
class StoreGiftLogModel extends AbstractModel
{
    protected $table = 'store_gift_log';

    protected $fillable = [
        'user_id', 'from_user_id', 'from_username', 'from_display_name', 'from_avatar_url',
        'store_id', 'cart_id', 'title', 'amount',
    ];

    public $timestamps = true;
}
