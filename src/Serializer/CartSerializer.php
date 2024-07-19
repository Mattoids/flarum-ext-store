<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;
use Illuminate\Cache\RateLimiting\Limit;
use Mattoid\Store\Enum\LimitUnitEnum;

class CartSerializer extends AbstractSerializer
{

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        return [
            'id' => $data->id,
            'storeId' => $data->store_id,
            'code' => $data->code,
            'title' => $data->title,
            'price' => $data->price,
            'payAmt' => $data->pay_amt,
            'type' => $data->type,
            'outtime' => $data->outtime,
            'status' => $data->status,
            'createdAt' => $data->created_at,
            'updatedAt' => $data->updated_at,
            'autoDeduction' => $data->auto_deduction,
            'enableType' => $data->enableType,
            'enable' => $data->enable
        ];
    }
}
