<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 商店级联筛选维度
 * Cascading store filter dimensions
 *
 * 返回有序维度数组，每级选项由已选上级过滤后计算（真联动）。
 * 所有选项只统计上架商品（status=1）：
 *   code     商品插件（第 1 级，仅列出有上架商品的插件）
 *   group    分组（第 2 级，插件声明 Goods::$group，商品可在后台覆盖）
 *   subtype  道具类型（第 3 级，来源：插件声明的 itemTypes；无声明时该维度隐藏）
 *   type     有效期（第 4 级：permanent/limit）
 *   discount 折扣（第 5 级：有折扣/无折扣）
 */
class FilterOptionsController extends AbstractShowController
{
    public $serializer = DataSerializer::class;

    protected $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        $params = $request->getQueryParams();
        $selGroup = Arr::get($params, 'filter.group', '-1');
        $selCode = Arr::get($params, 'filter.code', '-1');
        $selSubtype = Arr::get($params, 'filter.subtype', '-1');
        $selType = Arr::get($params, 'filter.type', '-1');

        $plugins = StoreExtend::getPlugins();

        // 上架商品（status=1）的 code 及其实际生效分组：
        // store.group 非空用 store.group，否则继承插件声明的 Goods::$group，再否则 default
        $codeGroupMap = [];
        $onShelfRows = StoreModel::query()->where('status', 1)
            ->select('code', 'group')->distinct()->get();
        foreach ($onShelfRows as $row) {
            $pluginGroup = isset($plugins[$row->code]) && $plugins[$row->code]->group
                ? $plugins[$row->code]->group
                : null;
            $codeGroupMap[$row->code] = $row->group ?: ($pluginGroup ?: 'default');
        }

        // 第 1 级：商品插件（仅列出有上架商品的插件，避免未上架插件混入筛选）
        $codeOptions = [];
        foreach ($codeGroupMap as $code => $group) {
            $codeOptions[] = [
                'value' => $code,
                'label' => isset($plugins[$code]) ? $this->translator->trans($plugins[$code]->name) : $code,
            ];
        }

        // 第 2 级：分组（限已选插件；未选插件时为全部上架商品的分组）
        $groupOptions = [];
        $groupSeen = [];
        foreach ($codeGroupMap as $code => $group) {
            if (($selCode && $selCode != '-1') && $selCode !== $code) {
                continue;
            }
            if (isset($groupSeen[$group])) {
                continue;
            }
            $groupSeen[$group] = true;
            $groupOptions[] = ['value' => $group, 'label' => $this->groupLabel($group)];
        }

        // 已选插件 + 已选分组后的适用插件（供第 3 级 itemTypes 使用）
        $applicableCodes = [];
        foreach ($codeGroupMap as $code => $group) {
            if (($selCode && $selCode != '-1') && $selCode !== $code) {
                continue;
            }
            if (($selGroup && $selGroup != '-1') && $selGroup !== $group) {
                continue;
            }
            $applicableCodes[] = $code;
        }

        // 第 3 级：道具类型（插件声明的 itemTypes，限适用插件；未选插件时为适用插件并集）
        $subtypeOptions = [];
        $subtypeSeen = [];
        if ($selCode && $selCode != '-1') {
            $itemTypesSource = isset($plugins[$selCode]) && in_array($selCode, $applicableCodes, true)
                ? [$selCode => $plugins[$selCode]]
                : [];
        } else {
            $itemTypesSource = array_intersect_key($plugins, array_flip($applicableCodes));
        }
        foreach ($itemTypesSource as $goods) {
            foreach ((array) $goods->itemTypes as $itemType) {
                if (!is_array($itemType) || empty($itemType['key']) || isset($subtypeSeen[$itemType['key']])) {
                    continue;
                }
                $subtypeSeen[$itemType['key']] = true;
                $subtypeOptions[] = [
                    'value' => $itemType['key'],
                    'label' => $this->translator->trans($itemType['name'] ?? $itemType['key']),
                ];
            }
        }

        // 第 4、5 级：由已选上级过滤后 distinct 计算，保证只出现有结果的选项
        $typeQuery = StoreModel::query()->where('status', 1);
        $this->applyPriorFilters($typeQuery, $plugins, $selGroup, $selCode, $selSubtype);
        $typeValues = $typeQuery->select('type')->distinct()->pluck('type');

        $discountQuery = StoreModel::query()->where('status', 1);
        $this->applyPriorFilters($discountQuery, $plugins, $selGroup, $selCode, $selSubtype, $selType);
        $hasDiscount = (clone $discountQuery)->where('discount', '>', 0)->exists();
        $hasNoDiscount = (clone $discountQuery)->where('discount', 0)->exists();

        $typeOptions = [];
        foreach (['permanent', 'limit'] as $value) {
            if ($typeValues->contains($value)) {
                $typeOptions[] = ['value' => $value, 'label' => $this->translator->trans('mattoid-store.lib.item-type-' . $value)];
            }
        }

        $discountOptions = [];
        if ($hasDiscount) {
            $discountOptions[] = ['value' => '1', 'label' => $this->translator->trans('mattoid-store.lib.filter-discount-on')];
        }
        if ($hasNoDiscount) {
            $discountOptions[] = ['value' => '0', 'label' => $this->translator->trans('mattoid-store.lib.filter-discount-off')];
        }

        // JSON:API 序列化要求资源为对象且带 id
        $result = new \stdClass();
        $result->id = 'filter-options';
        $result->dimensions = [
            ['key' => 'code', 'label' => $this->translator->trans('mattoid-store.lib.filter-code'), 'options' => $codeOptions, 'hidden' => count($codeOptions) === 0],
            ['key' => 'group', 'label' => $this->translator->trans('mattoid-store.lib.filter-group'), 'options' => $groupOptions, 'hidden' => count($groupOptions) <= 1],
            ['key' => 'subtype', 'label' => $this->translator->trans('mattoid-store.lib.filter-subtype'), 'options' => $subtypeOptions, 'hidden' => count($subtypeOptions) === 0],
            ['key' => 'type', 'label' => $this->translator->trans('mattoid-store.lib.filter-type'), 'options' => $typeOptions, 'hidden' => false],
            ['key' => 'discount', 'label' => $this->translator->trans('mattoid-store.lib.filter-discount'), 'options' => $discountOptions, 'hidden' => count($discountOptions) === 0],
        ];

        return $result;
    }

    /**
     * 分组显示名：default 用内置翻译；其余视为翻译键，无翻译时原样展示（后台自定义分组名）
     */
    private function groupLabel($group)
    {
        if ($group === 'default') {
            return $this->translator->trans('mattoid-store.lib.group-default');
        }
        $label = $this->translator->trans($group);
        return $label === $group ? $group : $label;
    }

    private function applyPriorFilters($query, $plugins, $group, $code, $subtype, $type = null)
    {
        if ($group && $group != '-1') {
            StoreExtend::filterByGroup($query, $group);
        }
        if ($code && $code != '-1') {
            $query->where('code', $code);
        }
        if ($subtype && $subtype != '-1') {
            $query->where('subtype', $subtype);
        }
        if ($type && $type != '-1') {
            $query->where('type', $type);
        }
    }
}
