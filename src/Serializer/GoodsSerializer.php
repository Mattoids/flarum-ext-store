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
            'popUp' => $data->pop_up ?: [],
            'itemTypes' => $data->item_types ?: [],
            'icon' => $data->icon,
            'extIcon' => $data->ext_icon ?: null,
            'createdAt' => $data->created_at,
        ];
    }
}
