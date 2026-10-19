<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

class DataSerializer extends AbstractSerializer
{
    protected function getDefaultAttributes($data) {
        if (is_object($data)) {
            return get_object_vars($data);
        }
        return is_array($data) ? $data : [];
    }
}
