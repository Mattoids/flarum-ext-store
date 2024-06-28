<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;
use Illuminate\Cache\RateLimiting\Limit;
use Mattoid\Store\Enum\LimitUnitEnum;

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
            'title' => $data->title,
            'uri' => $data->uri,
            'price' => $data->price,
            'stock' => $data->stock,
            'discount' => $data->discount,
            'discountLimit' => $data->discount_limit,
            'discountLimitUnit' => $data->discount_limit_unit,
            'discountLimitUnitStr' => LimitUnitEnum::$LIMIT_UNIT[$data->discount_limit_unit],
            'type' => $data->type,
            'outtime' => $data->outtime,
            'icon' => $data->icon,
            'hide' => $data->hide,
            'desc' => $data->desc,
            'popUp' => $data->pop_up,
            'status' => $data->status,
            'createdAt' => $data->created_at,
            'updatedAt' => $data->updated_at,
        ];
    }
}