<?php

namespace Mattoid\Store\Listeners;

use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Events\Dispatcher;
use Mattoid\Store\Event\StoreBuyFailEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Event\StoreStockSubEvent;

class StoreBuyFailListeners
{
    private $events;
    private $settings;
    private $translator;


    public function __construct(Dispatcher $events, SettingsRepositoryInterface $settings, Translator $translator)
    {
        $this->events = $events;
        $this->settings = $settings;
        $this->translator = $translator;
    }

    public function handle(StoreBuyFailEvent $event) {
        $cart = $event->cart;
        $store = $event->store;

        // 通知购物车购买失败
        $cart->status = 2;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 回滚用户余额
        $user = User::query()->where('id', $event->user->id)->first();
        $money = $user->money;
        $user->money = $user->money + $cart->pay_amt;
        $user->where('money', $money);
        $user->save();

        // 通知资金消费记录插件资金回滚
        if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
            $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, $cart->pay_amt, 'STOREBUYGOODSFAIL', $this->translator->trans("mattoid-store.forum.buy-goods-fail", ['title' => $store->title]), ''));
        }
    }
}
