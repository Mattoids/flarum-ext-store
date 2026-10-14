<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;

/**
 * 背包条目序列化器
 * Backpack item serializer
 *
 * 公共字段：source/refId/title/icon/createdAt
 * source=store：code/storeId/useType/subtype/type/outtime/autoDeduction/enable/remaining
 * source=decoration：itemType/itemStatus/itemCount/expiredDays/itemPropertyImage
 */
class BackpackItemSerializer extends AbstractSerializer
{
    protected function getDefaultAttributes($data)
    {
        $out = [
            'source' => $data->source,
            'refId' => $data->refId,
            'title' => $data->title,
            'icon' => $data->icon,
            'createdAt' => $data->createdAt,
        ];

        if ($data->source === 'store') {
            $out['code'] = $data->code;
            $out['storeId'] = $data->storeId;
            $out['useType'] = $data->useType;
            $out['subtype'] = $data->subtype;
            $out['type'] = $data->type;
            $out['outtime'] = $data->outtime;
            $out['autoDeduction'] = $data->autoDeduction;
            $out['enable'] = $data->enable;
            $out['remaining'] = $data->remaining;
        } else {
            $out['itemType'] = $data->itemType;
            $out['itemStatus'] = $data->itemStatus;
            $out['itemCount'] = $data->itemCount;
            $out['expiredDays'] = $data->expiredDays;
            $out['itemPropertyImage'] = $data->itemPropertyImage;
        }

        return $out;
    }
}
