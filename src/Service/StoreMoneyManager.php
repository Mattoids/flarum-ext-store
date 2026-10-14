<?php

namespace Mattoid\Store\Service;

use Flarum\User\User;
use Huoxin\MoneyWithHistory\Service\BalanceManager;
use Illuminate\Contracts\Events\Dispatcher;

/**
 * 商店资金管理器
 *
 * 所有商店相关的资金变动（购买扣款、失败退款、自动续费扣款）统一经过本服务。
 * 优先委托给 flarum-ext-checkin-with-history 的资金体系（huoxin/money-with-history），
 * 由它完成行锁扣款、历史流水写入与事件通知；
 * 未安装该体系时回退到商店自带的原生 SQL 模式（条件扣减 + 旧版资金事件）。
 */
class StoreMoneyManager
{
    /**
     * @var Dispatcher
     */
    private $events;

    /**
     * @var BalanceManager|null
     */
    private $balanceManager;

    public function __construct(Dispatcher $events)
    {
        $this->events = $events;

        if (class_exists(BalanceManager::class)) {
            $this->balanceManager = resolve(BalanceManager::class);
        }
    }

    /**
     * 是否由 checkin-with-history 资金体系托管
     */
    public function isManaged(): bool
    {
        return $this->balanceManager !== null;
    }

    /**
     * 扣款（余额不足时返回 false，调用方必须回滚业务）
     *
     * @param User $user 被扣款用户
     * @param float $price 扣款金额
     * @param string $source 资金来源标识（如 STOREBUYGOODS）
     * @param string $sourceKey 流水文案翻译键（huoxin 体系下写入历史流水）
     * @param array $params 流水文案参数
     * @param string $legacyMessage 旧版资金事件的消息文案（仅回退模式使用）
     * @param User|null $actor 操作人（缺省为被扣款用户本人）
     */
    public function pay(User $user, float $price, string $source, string $sourceKey, array $params = [], string $legacyMessage = '', ?User $actor = null): bool
    {
        if ($this->balanceManager) {
            return $this->balanceManager->adjustBalance($user, -$price, $source, $sourceKey, $params, $actor, true);
        }

        // 回退模式：原子扣款，仅当余额仍足额时扣减，防止并发透支
        $affected = $user->newQuery()->where('id', $user->id)->where('money', '>=', $price)->decrement('money', $price);
        if (!$affected) {
            return false;
        }
        $user->money -= $price;

        $this->dispatchLegacyEvent($user, -$price, $source, $legacyMessage);

        return true;
    }

    /**
     * 退款
     *
     * @param User $user 收款用户
     * @param float $amount 退款金额
     * @param string $source 资金来源标识（如 STOREBUYGOODSFAIL）
     * @param string $sourceKey 流水文案翻译键
     * @param array $params 流水文案参数
     * @param string $legacyMessage 旧版资金事件的消息文案（仅回退模式使用）
     * @param User|null $actor 操作人
     */
    public function refund(User $user, float $amount, string $source, string $sourceKey, array $params = [], string $legacyMessage = '', ?User $actor = null): bool
    {
        if ($amount <= 0) {
            return false;
        }

        if ($this->balanceManager) {
            return $this->balanceManager->adjustBalance($user, $amount, $source, $sourceKey, $params, $actor);
        }

        // 回退模式：原子累加退款
        $user->newQuery()->where('id', $user->id)->increment('money', $amount);
        $user->money += $amount;

        $this->dispatchLegacyEvent($user, $amount, $source, $legacyMessage);

        return true;
    }

    /**
     * 回退模式下通知旧版资金消费记录插件（mattoid/money-history）
     */
    private function dispatchLegacyEvent(User $user, float $delta, string $source, string $message): void
    {
        if ($message === '') {
            return;
        }

        if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
            $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, $delta, $source, $message, ''));
        }
    }
}
