<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Extension\ExtensionManager;
use Flarum\Locale\Translator;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Enum\LimitUnitEnum;
use Mattoid\Store\Service\PricingService;
use Mattoid\Store\Utils\ExtensionIconUtil;

class StoreSerializer extends AbstractSerializer
{
    protected $translator;
    protected $extensions;
    protected $pricing;
    /** 单次请求内有效折扣价的计算缓存（窗口判定含 Carbon 解析，逐个商品重复计算浪费） */
    private $discountPriceCache = [];

    public function __construct(Translator $translator, ExtensionManager $extensions, PricingService $pricing)
    {
        $this->translator = $translator;
        $this->extensions = $extensions;
        $this->pricing = $pricing;
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
            // 输出"当前生效"的折扣价而非静态列：窗口过期后前端不再显示折扣价，与实付口径一致
            'discountPrice' => $this->effectiveDiscountPrice($data),
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
            'purchaseLimitEnable' => (int) $data->purchase_limit_enable,
            'purchaseLimitCount' => (int) $data->purchase_limit_count,
            'purchaseLimitPeriod' => (int) $data->purchase_limit_period,
            'purchaseLimitPeriodUnit' => $data->purchase_limit_period_unit,
            'usable' => (int) $data->usable,
            'pluginIcon' => $plugin ? $plugin->icon : '',
            'pluginExtIcon' => $extIcon,
            'createdAt' => $data->created_at,
            'updatedAt' => $data->updated_at,
            // 回收站视图依赖此字段判行类型（软删行由 ListStoreController 的 trashed 筛选返回）
            'deletedAt' => $data->deleted_at,
        ];
    }

    private function effectiveDiscountPrice($store): float
    {
        $key = $store->code ?? $store->id;
        if (! array_key_exists($key, $this->discountPriceCache)) {
            $this->discountPriceCache[$key] = $this->pricing->activeDiscountPrice($store);
        }

        return $this->discountPriceCache[$key];
    }
}
