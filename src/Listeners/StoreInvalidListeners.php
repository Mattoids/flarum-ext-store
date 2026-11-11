<?php

namespace Mattoid\Store\Listeners;

use Flarum\Locale\Translator;
use Flarum\Notification\NotificationSyncer;
use Flarum\User\User;
use Mattoid\Store\Event\StoreInvalidEvent;
use Mattoid\Store\Notification\StoreNotificationBlueprint;

/**
 * 道具到期/失效通知：GoodsInvalidCommand 触发 StoreInvalidEvent 后通知持有者
 */
class StoreInvalidListeners
{
    private $syncer;
    private $translator;

    public function __construct(NotificationSyncer $syncer, Translator $translator)
    {
        $this->syncer = $syncer;
        $this->translator = $translator;
    }

    public function handle(StoreInvalidEvent $event)
    {
        $user = User::query()->where('id', $event->cart->user_id)->first();
        if (! $user) {
            return;
        }

        // 自动续费成功：发"续期提醒"，点击跳转本人资金交易记录；续费失败（到期）：跳转商店
        $renewed = $event->status === true;
        // fromUser 用持有者本人（cron 场景无实际操作者）
        $blueprint = new StoreNotificationBlueprint($event->store, $user, [
            // cartId 使每条通知唯一，避免通知系统按 subject+data 去重后只通知一次
            'cartId' => $event->cart->id,
            'url' => $renewed ? '/u/'.$user->username.'/money/history' : '/store',
            'message' => $this->translator->trans(
                $renewed ? 'mattoid-store.forum.notification.goods-renewed' : 'mattoid-store.forum.notification.goods-invalid',
                ['title' => $event->store->title]
            ),
        ]);
        $this->syncer->sync($blueprint, [$user]);
    }
}
