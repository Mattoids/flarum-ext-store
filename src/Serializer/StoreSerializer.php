<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;

class StoreSerializer extends AbstractSerializer
{

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        return [
            'id' => $data->id,
            'code' => $data->code,
            'name' => $this->translator->trans($data->name),
            'uri' => $data->uri,
            'createTime' => $data->create_time,
        ];
    }
}
