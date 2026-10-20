<?php

namespace Mattoid\Store\Notification;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\User\User;
use Mattoid\Store\Model\StoreModel;

class StoreNotificationBlueprint implements BlueprintInterface
{
    public $store;
    public $fromUser;
    public $data;
    protected $icon = 'fas fa-gift';

    /**
     * @param StoreModel $store   赠送/到期的商品（通知 subject）
     * @param User       $fromUser 操作者（赠送时为管理员；到期通知时为持有者本人）
     * @param array      $data    额外数据（message/url 文案由监听方按持有者的 locale 翻译后传入）
     */
    public function __construct(StoreModel $store, User $fromUser, array $data)
    {
        $this->store = $store;
        $this->fromUser = $fromUser;
        $this->data = $data;
    }

    public function getSubject()
    {
        return $this->store;
    }

    public function getFromUser()
    {
        return $this->fromUser;
    }

    public function getData()
    {
        // 不修改 $this->data（同一实例可能多次序列化），合并 icon 后返回
        return array_merge($this->data, ['icon' => $this->icon]);
    }

    public static function getType()
    {
        return 'storeGiftNotification';
    }

    public static function getSubjectModel()
    {
        return StoreModel::class;
    }
}
