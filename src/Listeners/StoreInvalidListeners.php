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

        // fromUser 用持有者本人（cron 场景无实际操作者）
        $blueprint = new StoreNotificationBlueprint($event->store, $user, [
            'url' => '/store',
            'message' => $this->translator->trans('mattoid-store.forum.notification.goods-invalid', ['title' => $event->store->title]),
        ]);
        $this->syncer->sync($blueprint, [$user]);
    }
}
