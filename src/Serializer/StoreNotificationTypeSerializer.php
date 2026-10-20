<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

class StoreNotificationTypeSerializer extends AbstractSerializer
{
    protected $type = 'notification-store-types';

    protected function getDefaultAttributes($model): array
    {
        return [
            'id' => $model->id,
            'url' => '/store',
            'excerpt' => '',
            'message' => ''
        ];
    }
}
