<?php

namespace Mattoid\Store\Utils;

use Flarum\Extension\ExtensionManager;

/**
 * 解析商品插件所属扩展的图标（composer.json extra.flarum-extension.icon）。
 * Resolve the icon of the extension that owns a goods plugin (composer.json extra.flarum-extension.icon).
 */
class ExtensionIconUtil
{
    /**
     * 通过 Goods 类的文件位置反查所属扩展，取其声明的图标数组。
     * Find the owning extension via the Goods class file path and return its declared icon array.
     *
     * @param object $goods Goods 实例
     * @return array|null 形如 ['name' => 'fas fa-xxx', 'color' => '#fff', 'backgroundColor' => '#536b85']，未声明时返回 null
     */
    public static function resolve($goods, ExtensionManager $extensions): ?array
    {
        $classFile = (new \ReflectionClass($goods))->getFileName();
        $classFile = $classFile ? realpath($classFile) : false;
        if (!$classFile) {
            return null;
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
                return !empty($icon['name']) ? $icon : null;
            }
        }
        return null;
    }
}
