<?php

namespace Mattoid\Store\Utils;

class ObjectsUtil
{
    public static function removeEmpty(array $params) {
        $result = [];
        foreach (array_keys($params) as $key) {
            if (!empty($params[$key])) {
                $result[$key] = $params[$key];
            }
        }

        return $result;
    }

    public static function removeEmptySql(array $params) {
        $result = [];
        foreach (array_keys($params) as $key) {
            if (!empty($params[$key]) || $params[$key] === 0 || $params[$key] === '0') {
                $result[StringUtil::toUnderScore($key)] = $params[$key];
            }
        }

        return $result;
    }
}
