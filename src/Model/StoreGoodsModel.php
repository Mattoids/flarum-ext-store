<?php

namespace Mattoid\Store\Model;

use Flarum\Database\AbstractModel;

/**
 * 可添加商品（插件注册表条目）的数据载体，仅内存使用，不落库。
 * pop_up/item_types/ext_icon 直接持有数组。
 */
class StoreGoodsModel extends AbstractModel
{
    protected $table = "store_goods";
}
