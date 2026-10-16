<?php

namespace Mattoid\Store\Service;

use Carbon\Carbon;
use Mattoid\Store\Model\StoreModel;

/**
 * 价格计算：按折扣窗口计算应付金额
 * Price calculation: payable amount based on the discount window
 *
 * 统一口径：窗口起点为 discount_start_at，未设置的老数据回退 updated_at。
 * Single source of truth: window starts at discount_start_at, falls back to updated_at for legacy rows.
 */
class PricingService
{
    public function payablePrice(StoreModel $store): float
    {
        $price = $store->price;
        $startAt = $store->discount_start_at ?: $store->updated_at;
        $endTime = $startAt ? Carbon::parse($startAt)->add($store->discount_limit, $store->discount_limit_unit)->getTimestamp() : 0;
        if ($store->discount_price > 0 && $store->discount > 0 && time() < $endTime) {
            $price = $store->discount_price;
        }

        return $price;
    }
}
