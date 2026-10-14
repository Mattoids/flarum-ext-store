<?php

namespace Mattoid\Store\Listeners;

use Flarum\Locale\Translator;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreBuyFailEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Model\StoreCartModel;

/**
 * 购买失败处理逻辑（退款 + 库存回补，由购物车编辑事件完成库存回滚）
 */
class StoreBuyFailListeners
{
    private $events;
    private $translator;

    public function __construct(Dispatcher $events, Translator $translator)
    {
        $this->events = $events;
        $this->translator = $translator;
    }

    public function handle(StoreBuyFailEvent $event) {
        // 重新读取购物车，防止重复回滚（状态已为 2 表示已回滚过）
        $cart = StoreCartModel::query()->where('id', $event->cart->id)->first();
        if (!$cart || $cart->status == 2) {
            return;
        }
        $store = $event->store;

        // 通知购物车购买失败（status=2 会触发库存回滚）
        $cart->status = 2;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 回滚用户余额
        $user = User::query()->where('id', $event->user->id)->first();
        if ($user) {
            // 原子累加退款
            User::query()->where('id', $user->id)->increment('money', $cart->pay_amt);
            $user->money += $cart->pay_amt;

            // 通知资金消费记录插件资金回滚
            if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
                $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, $cart->pay_amt, 'STOREBUYGOODSFAIL', $this->translator->trans("mattoid-store.forum.buy-goods-fail", ['title' => $store->title]), ''));
            }
        }
    }
}
