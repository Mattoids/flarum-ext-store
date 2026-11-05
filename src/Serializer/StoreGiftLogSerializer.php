<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

/**
 * 赠送记录序列化器（获赠视角）
 */
class StoreGiftLogSerializer extends AbstractSerializer
{
    protected function getDefaultAttributes($data)
    {
        return [
            'id' => $data->id,
            'storeId' => $data->store_id,
            'title' => $data->title,
            'amount' => (int) $data->amount,
            'fromUser' => [
                'id' => (int) $data->from_user_id,
                'username' => $data->from_username,
                'displayName' => $data->from_display_name,
                'avatarUrl' => $data->from_avatar_url,
            ],
            'createdAt' => $data->created_at ? $this->formatDate($data->created_at) : null,
        ];
    }
}
