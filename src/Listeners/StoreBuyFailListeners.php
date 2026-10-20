<?php

namespace Mattoid\Store\Listeners;

use Flarum\Locale\Translator;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\Log;
use Mattoid\Store\Event\StoreBuyFailEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Service\StoreMoneyManager;

/**
 * 购买失败处理逻辑（退款 + 库存回补，由购物车编辑事件完成库存回滚）
 */
class StoreBuyFailListeners
{
    private $events;
    private $translator;
    private $money;

    public function __construct(Dispatcher $events, Translator $translator, StoreMoneyManager $money)
    {
        $this->events = $events;
        $this->translator = $translator;
        $this->money = $money;
    }

    public function handle(StoreBuyFailEvent $event) {
        // 重新读取购物车，防止重复回滚（状态已为 2 表示已回滚过）
        $cart = StoreCartModel::query()->where('id', $event->cart->id)->first();
        if (!$cart || $cart->status == 2) {
            return;
        }
        $store = $event->store;

        // 通知购物车购买失败（status=2 会触发库存回滚）；回滚事件自身失败仅记日志，
        // 不阻断后续退款，也不让购买者看到 500
        $cart->status = 2;
        try {
            $this->events->dispatch(new StoreCartEditEvent($cart));
        } catch (\Throwable $e) {
            Log::error('[mattoid-store] 购买失败库存回滚事件处理异常', ['cart_id' => $cart->id, 'exception' => $e]);
        }

        // 回滚用户余额（交由资金管理器，优先 checkin-with-history 资金体系）
        $user = User::query()->where('id', $event->user->id)->first();
        if ($user) {
            $this->money->refund(
                $user,
                $cart->pay_amt,
                'STOREBUYGOODSFAIL',
                'mattoid-store.forum.money-history.buy-goods-fail',
                ['title' => $store->title],
                $this->translator->trans('mattoid-store.forum.buy-goods-fail', ['title' => $store->title])
            );
        }
    }
}
