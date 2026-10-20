<?php

namespace Mattoid\Store\Service;

use Carbon\Carbon;
use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Illuminate\Support\Facades\Log;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;

/**
 * 限购校验：统计当前用户在限购周期内购买成功的次数，超限直接拒绝
 * Purchase limit validation: counts successful purchases within the limit period, rejects when exceeded
 *
 * 限购周期填 0 表示终身限购：统计历史全部购买次数，不按时间窗口过滤。
 * Period = 0 means lifetime limit: count all historical purchases without time window.
 */
class PurchaseLimiter
{
    protected $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @throws ValidationException 超限时抛出对应文案的异常
     */
    public function check($actor, StoreModel $store): void
    {
        if (! $store->purchase_limit_enable || $store->purchase_limit_count <= 0) {
            return;
        }

        if ($this->countPurchases($actor, $store) < $store->purchase_limit_count) {
            return;
        }

        $this->throwExceeded($actor, $store);
    }

    /**
     * 插入购物车记录后在同一事务内复查：已购数（含刚置为 status=1 的记录）超出限购则抛出，
     * 使整笔购买回滚，堵住 count 检查与插入之间的并发窗口（配合请求级防连击锁）。
     * 与 check() 不同，这里允许已购数恰好等于限购数（当前这笔买完后刚好满额是合法的）。
     */
    public function assertNotExceeded($actor, StoreModel $store): void
    {
        if (! $store->purchase_limit_enable || $store->purchase_limit_count <= 0) {
            return;
        }

        if ($this->countPurchases($actor, $store) > $store->purchase_limit_count) {
            $this->throwExceeded($actor, $store);
        }
    }

    private function countPurchases($actor, StoreModel $store): int
    {
        $periodSeconds = $this->periodUnitToSeconds($store->purchase_limit_period_unit) * (int) $store->purchase_limit_period;
        $boughtQuery = StoreCartModel::query()->where('user_id', $actor->id)->where('store_id', $store->id)
            ->where('status', 1);
        if ($periodSeconds > 0) {
            $boughtQuery->where('created_at', '>=', Carbon::now()->subSeconds($periodSeconds));
        }

        return $boughtQuery->count();
    }

    /**
     * @throws ValidationException
     */
    private function throwExceeded($actor, StoreModel $store): void
    {
        $periodSeconds = $this->periodUnitToSeconds($store->purchase_limit_period_unit) * (int) $store->purchase_limit_period;
        if ($periodSeconds > 0) {
            // 周期限购：按窗口内最早一笔购买时间推算下次可购买时间
            $boughtQuery = StoreCartModel::query()->where('user_id', $actor->id)->where('store_id', $store->id)
                ->where('status', 1);
            $boughtQuery->where('created_at', '>=', Carbon::now()->subSeconds($periodSeconds));
            $oldest = $boughtQuery->min('created_at');
            $retryAt = $oldest ? Carbon::parse($oldest)->addSeconds($periodSeconds) : null;
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.purchase-limit-exceeded-period', [
                'count' => $store->purchase_limit_count,
                'period' => (int) $store->purchase_limit_period,
                'unit' => $this->translator->trans('mattoid-store.lib.item-limit-unit-'.$store->purchase_limit_period_unit),
                'time' => $retryAt ? $retryAt->format('Y-m-d H:i') : '',
            ])]);
        }
        throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.purchase-limit-exceeded-lifetime', [
            'count' => $store->purchase_limit_count,
        ])]);
    }

    /**
     * 限购周期单位换算为秒（与 LimitUnitEnum 保持一致）。
     * 未知单位记 warning 日志并保守回退为终身限购（0 秒），避免静默改变限购语义
     */
    private static function periodUnitToSeconds($unit)
    {
        $map = ['days' => 86400, 'hour' => 3600, 'minute' => 60, 'second' => 1];
        if (! is_string($unit) || ! array_key_exists($unit, $map)) {
            Log::warning("[mattoid-store] unknown purchase_limit_period_unit '{$unit}', fallback to lifetime limit");

            return 0;
        }

        return $map[$unit];
    }
}
