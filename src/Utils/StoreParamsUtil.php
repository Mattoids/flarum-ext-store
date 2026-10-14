<?php

namespace Mattoid\Store\Utils;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Mattoid\Store\Enum\LimitUnitEnum;

/**
 * 商品写入参数校验工具
 * 将请求体收敛为允许写入 store 表的字段，并做基本类型/范围校验，
 * 防止批量赋值注入任意列或非法值（如负价格）。
 */
class StoreParamsUtil
{
    const ALLOWED_FIELDS = [
        'code', 'title', 'price', 'stock', 'discount', 'discount_limit',
        'discount_limit_unit', 'type', 'status', 'outtime', 'icon',
        'hide', 'repeat', 'desc', 'auto_deduction', 'use_type', 'subtype',
        'group',
    ];

    const ALLOWED_TYPES = ['permanent', 'limit'];

    const ALLOWED_USE_TYPES = ['permanent', 'consumable'];

    // 新增时未传字段的默认值（与后台表单初始值一致，避免缺列插入 NULL）
    const CREATE_DEFAULTS = [
        'status' => 1,
        'stock' => -99,
        'discount' => 0,
        'discount_limit' => 0,
        'discount_limit_unit' => 'days',
        'type' => 'permanent',
        'outtime' => 0,
        'icon' => '',
        'hide' => 0,
        'repeat' => 1,
        'desc' => '',
        'auto_deduction' => 0,
        'use_type' => 'permanent',
    ];

    /**
     * 过滤并校验请求参数
     *
     * @param array $input 原始请求体
     * @param bool  $isCreate 是否为新增（新增时 title/price 必填）
     * @return array 可直接用于 insert/update 的下划线字段数组
     */
    public static function sanitizeForWrite(array $input, bool $isCreate): array
    {
        $translator = resolve(Translator::class);
        $fail = function () use ($translator) {
            throw new ValidationException(['message' => $translator->trans('mattoid-store.admin.error.invalid-params')]);
        };

        // 先将驼峰键统一转为下划线（前端表单发送 camelCase 字段），再按白名单过滤
        $normalized = [];
        foreach ($input as $key => $value) {
            if (is_string($key)) {
                $normalized[StringUtil::toUnderScore($key)] = $value;
            }
        }
        $data = array_intersect_key($normalized, array_flip(self::ALLOWED_FIELDS));

        if (isset($data['code']) && !is_string($data['code'])) {
            $fail();
        }

        if ($isCreate && (empty($data['title']) || !is_string($data['title']))) {
            $fail();
        }
        if (isset($data['title']) && !is_string($data['title'])) {
            $fail();
        }

        // 价格必须为非负数字（负价格可被用来购买刷钱）
        if ($isCreate && (!array_key_exists('price', $data) || !is_numeric($data['price']))) {
            $fail();
        }
        if (array_key_exists('price', $data)) {
            if (!is_numeric($data['price']) || $data['price'] < 0) {
                $fail();
            }
            $data['price'] = (float) $data['price'];
        }

        // 库存：0 或 -99 视为无限
        if (array_key_exists('stock', $data)) {
            if (!is_numeric($data['stock'])) {
                $fail();
            }
            $data['stock'] = ((int) $data['stock'] == 0 || (int) $data['stock'] == -99) ? -99 : (int) $data['stock'];
        }

        // 折扣 0-100
        foreach (['discount' => 100, 'discount_limit' => null] as $field => $max) {
            if (array_key_exists($field, $data)) {
                if (!is_numeric($data[$field]) || $data[$field] < 0 || ($max !== null && $data[$field] > $max)) {
                    $fail();
                }
                $data[$field] = (int) $data[$field];
            }
        }

        if (array_key_exists('discount_limit_unit', $data)
            && (!is_string($data['discount_limit_unit']) || !array_key_exists($data['discount_limit_unit'], LimitUnitEnum::$LIMIT_UNIT))) {
            $fail();
        }

        if (isset($data['type']) && (!is_string($data['type']) || !in_array($data['type'], self::ALLOWED_TYPES, true))) {
            $fail();
        }

        if (array_key_exists('use_type', $data)) {
            if (!is_string($data['use_type']) || !in_array($data['use_type'], self::ALLOWED_USE_TYPES, true)) {
                $fail();
            }
        }

        if (array_key_exists('subtype', $data)) {
            if (!is_string($data['subtype']) || mb_strlen($data['subtype']) > 50) {
                $fail();
            }
            $data['subtype'] = $data['subtype'] === '' ? null : $data['subtype'];
        }

        if (array_key_exists('group', $data)) {
            if (!is_string($data['group']) || mb_strlen($data['group']) > 50) {
                $fail();
            }
            $data['group'] = $data['group'] === '' ? null : $data['group'];
        }

        if (array_key_exists('status', $data)) {
            if (!is_scalar($data['status']) || !in_array((int) $data['status'], [0, 1], true)) {
                $fail();
            }
            $data['status'] = (int) $data['status'];
        }

        if (array_key_exists('outtime', $data)) {
            if (!is_numeric($data['outtime']) || $data['outtime'] < 0) {
                $fail();
            }
            $data['outtime'] = (int) $data['outtime'];
        }

        // 0/1 开关字段
        foreach (['hide', 'repeat', 'auto_deduction'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = !empty($data[$field]) ? 1 : 0;
            }
        }

        if (isset($data['icon']) && !is_string($data['icon'])) {
            $fail();
        }
        if (isset($data['desc']) && !is_string($data['desc'])) {
            $fail();
        }

        if ($isCreate) {
            foreach (self::CREATE_DEFAULTS as $field => $default) {
                if (!array_key_exists($field, $data)) {
                    $data[$field] = $default;
                }
            }
        }

        return $data;
    }

    /**
     * 计算折扣价（与历史逻辑保持一致）
     */
    public static function calcDiscountPrice($price, $discount)
    {
        if (extension_loaded('bcmath')) {
            return bcdiv(bcmul((string) $price, (string) $discount), '100', 2);
        }

        return round($price * $discount / 100, 2);
    }
}
