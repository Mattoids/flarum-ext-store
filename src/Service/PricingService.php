<?php

namespace Mattoid\Store\Service;

use Carbon\Carbon;
use Mattoid\Store\Enum\LimitUnitEnum;
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
        // 单位非法（老数据/改库）视为无折扣窗口，避免 Carbon::add 抛异常导致购买 500
        $unitValid = is_string($store->discount_limit_unit) && array_key_exists($store->discount_limit_unit, LimitUnitEnum::$LIMIT_UNIT);
        $startAt = $store->discount_start_at ?: $store->updated_at;
        $startTs = $startAt && $unitValid ? Carbon::parse($startAt)->getTimestamp() : 0;
        $endTime = $startTs ? Carbon::parse($startAt)->add($store->discount_limit, $store->discount_limit_unit)->getTimestamp() : 0;
        // 窗口同时有上下界：未到 startAt 的折扣不提前生效
        if ($store->discount_price > 0 && $store->discount > 0 && $startTs > 0 && time() >= $startTs && time() < $endTime) {
            // min 守卫：管理员配错导致折扣价高于原价时，按原价收
            $price = min($store->price, $store->discount_price);
        }

        return $price;
    }

    /**
     * 当前生效的折扣价：与 payablePrice 同一窗口口径，保证"看到的价格=实付价"。
     * 窗口外（或未打折）返回 0，前端以 0 判定无折扣
     */
    public function activeDiscountPrice(StoreModel $store): float
    {
        $payable = $this->payablePrice($store);

        return $payable < $store->price ? $payable : 0;
    }
}
