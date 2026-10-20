<?php

namespace Mattoid\Store\Utils;

use Flarum\Extension\ExtensionManager;

/**
 * 解析商品插件所属扩展的图标（composer.json extra.flarum-extension.icon）。
 * Resolve the icon of the extension that owns a goods plugin (composer.json extra.flarum-extension.icon).
 */
class ExtensionIconUtil
{
    /** @var array<string, array|null> 单次请求内按类名缓存，避免列表页逐行 reflection + 磁盘 realpath */
    private static $cache = [];

    /**
     * 通过 Goods 类的文件位置反查所属扩展，取其声明的图标数组。
     * Find the owning extension via the Goods class file path and return its declared icon array.
     *
     * @param object $goods Goods 实例
     * @return array|null 形如 ['name' => 'fas fa-xxx', 'color' => '#fff', 'backgroundColor' => '#536b85']，未声明时返回 null
     */
    public static function resolve($goods, ExtensionManager $extensions): ?array
    {
        $cacheKey = get_class($goods);
        if (array_key_exists($cacheKey, self::$cache)) {
            return self::$cache[$cacheKey];
        }

        $classFile = (new \ReflectionClass($goods))->getFileName();
        $classFile = $classFile ? realpath($classFile) : false;
        if (!$classFile) {
            return self::$cache[$cacheKey] = null;
        }

        $classFile = str_replace('\\', '/', $classFile);

        foreach ($extensions->getExtensions() as $extension) {
            $extPath = realpath($extension->getPath());
            if (!$extPath) {
                continue;
            }
            $extPath = str_replace('\\', '/', $extPath);
            if (strpos($classFile, $extPath . '/') === 0) {
                $icon = $extension->getIcon();
                // font-awesome 名与图片图标（backgroundImage）任一存在即视为有效图标
                return self::$cache[$cacheKey] = (!empty($icon['name']) || !empty($icon['backgroundImage'])) ? $icon : null;
            }
        }
        return self::$cache[$cacheKey] = null;
    }
}
