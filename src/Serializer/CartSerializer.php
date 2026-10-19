<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

class CartSerializer extends AbstractSerializer
{
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
            'renewedAt' => $data->renewed_at,
            'autoDeduction' => $data->auto_deduction,
            'enable' => $data->enable
        ];
    }
}
