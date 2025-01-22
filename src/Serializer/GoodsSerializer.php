<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;

class GoodsSerializer extends AbstractSerializer
{
    protected $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        return [
            'code' => $data->code,
            'name' => $this->translator->trans($data->name),
            'createdAt' => $data->created_at,
        ];
    }
}
