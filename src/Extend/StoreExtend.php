<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Container\Container;
use Mattoid\Store\Model\StoreCommodityModel;
use Mattoid\Store\Model\StoreModel;
use Symfony\Contracts\Translation\TranslatorInterface;

class StoreExtend implements ExtenderInterface, LifecycleInterface
{

    protected $goodList = [];

    public function __construct()
    {
        $this->settings = resolve(SettingsRepositoryInterface::class);
        $this->translator = resolve(TranslatorInterface::class);
    }

    public function addStoreGoods(string $key, $callback): self
    {
        $this->goodList[$key] = $callback;
        return $this;
    }

    public function getStoreGoods(String $key)
    {
        $class = $this->goodList[$key];
        return new $class();
    }

    public function extend(Container $container, Extension $extension = null)
    {
    }


    public function onEnable(Container $container, Extension $extension)
    {
        $commodity = $this->getStoreGoods($extension->name);

        StoreCommodityModel::query()->insert([
            'code' => $commodity->code,
            'name' => $commodity->name,
            'uri' => $commodity->uri,
            'pop_up' => json_encode($commodity->popUp),
            'create_time' => Date("Y-m-d H:i:s")
        ]);
    }

    public function onDisable(Container $container, Extension $extension)
    {
        $commodity = $this->getStoreGoods($extension->name);
        // 插件关闭自动删除已上架商品
        StoreModel::query()->where('code', $commodity->code)->delete();
        // 插件关闭自动移除可上架商品
        StoreCommodityModel::query()->where('code', $commodity->code)->delete();
    }
}
