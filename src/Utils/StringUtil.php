<?php

namespace Mattoid\Store\Utils;

class StringUtil
{
    /**
     * 驼峰转下划线
     * @param $str
     * @return string
     */
    public static function toUnderScore($str)
    {
        $dstr = preg_replace_callback('/([A-Z]+)/',function($matchs)
        {
            return '_'.strtolower($matchs[0]);
        },$str);
        return trim(preg_replace('/_{2,}/','_',$dstr),'_');
    }

    /**
     * 下划线转驼峰
     * @param $str
     * @return mixed|string
     */
    public static function toCamelCase($str)
    {
        $array = explode('_', $str);
        $result = $array[0];
        $len=count($array);
        if($len>1)
        {
            for($i=1;$i<$len;$i++)
            {
                $result.= ucfirst($array[$i]);
            }
        }
        return $result;
    }
}
