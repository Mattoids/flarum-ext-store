<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

class IconSerializer extends AbstractSerializer
{
    protected function getDefaultAttributes($data) {
        return [
            'uuid' => $data->uuid,
            'url' => $data->url,
            'count' => $data->count,
            'createdAt' => $data->created_at,
        ];
    }
}
