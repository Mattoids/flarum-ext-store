<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;

class IconSerializer extends AbstractSerializer
{

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        return [
            'uuid' => $data->uuid,
            'url' => $data->url,
            'count' => $data->count,
            'createdAt' => $data->created_at,
        ];
    }
}
