<?php

namespace Mattoid\Store\Attributes;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\User;

/**
 * 商店权限属性：值只取决于当前登录者（actor），与被序列化的用户无关，
 * 因此只挂在「用户自己」的序列化结果上，避免帖子列表等高频场景为每个用户重复计算/传输。
 */
class UserAttributes
{
    public function __invoke(BasicUserSerializer $serializer, User $user) {
        $actor = $serializer->getActor();
        if (!$actor->id || $actor->id !== $user->id) {
            return [];
        }

        return [
            'canStoreView' => $actor->can('mattoid-store.group-view'),
            'canStoreModerate' => $actor->can('mattoid-store.group-moderate'),
        ];
    }
}
