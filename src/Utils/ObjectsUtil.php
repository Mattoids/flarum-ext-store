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
            if (!empty($params[$key])) {
                $result[StringUtil::toUnderScore($key)] = $params[$key];
            }
        }

        return $result;
    }
}
