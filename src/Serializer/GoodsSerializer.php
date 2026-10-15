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
            'outtime' => $data->outtime !== null ? (int) $data->outtime : null,
            'purchaseLimitEnable' => $data->purchase_limit_enable !== null ? (int) $data->purchase_limit_enable : null,
            'purchaseLimitCount' => $data->purchase_limit_count !== null ? (int) $data->purchase_limit_count : null,
            'purchaseLimitPeriod' => $data->purchase_limit_period !== null ? (int) $data->purchase_limit_period : null,
            'purchaseLimitPeriodUnit' => $data->purchase_limit_period_unit,
            'createdAt' => $data->created_at,
        ];
    }
}
