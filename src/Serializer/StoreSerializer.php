<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Extension\ExtensionManager;
use Flarum\Locale\Translator;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Enum\LimitUnitEnum;
use Mattoid\Store\Utils\ExtensionIconUtil;

class StoreSerializer extends AbstractSerializer
{
    protected $translator;
    protected $extensions;

    public function __construct(Translator $translator, ExtensionManager $extensions)
    {
        $this->translator = $translator;
        $this->extensions = $extensions;
    }

    protected function getDefaultAttributes($data) {
        $plugin = StoreExtend::getPlugins()[$data->code] ?? null;
        $extIcon = $plugin ? ExtensionIconUtil::resolve($plugin, $this->extensions) : null;
        return [
            'id' => $data->id,
            'code' => $data->code,
            'title' => $data->title,
            'price' => $data->price,
            'stock' => $data->stock,
            'discount' => $data->discount,
            'discountLimit' => $data->discount_limit,
            'discountLimitUnit' => $data->discount_limit_unit,
            'discountPrice' => $data->discount_price,
            'discountStartAt' => $data->discount_start_at,
            'type' => $data->type,
            'outtime' => $data->outtime,
            'icon' => $data->icon,
            'hide' => $data->hide,
            'repeat' => $data->repeat,
            'desc' => $data->desc,
            'popUp' => $data->pop_up,
            'status' => $data->status,
            'autoDeduction' => $data->auto_deduction,
            'useType' => $data->use_type,
            'subtype' => $data->subtype,
            'group' => $data->group,
            'pluginIcon' => $plugin ? $plugin->icon : '',
            'pluginExtIcon' => $extIcon,
            'createdAt' => $data->created_at,
            'updatedAt' => $data->updated_at,
        ];
    }
}
