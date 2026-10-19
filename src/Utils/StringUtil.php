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
}
