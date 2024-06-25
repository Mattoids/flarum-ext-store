<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Container\Container;
use Mattoid\Store\Model\StoreCommodityModel;
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

    public function extend(Container $container, Extension $extension = null)
    {
    }


    public function onEnable(Container $container, Extension $extension)
    {
        $key = $extension->name;
        $class = $this->goodList[$key];
        $commodity = new $class();

        StoreCommodityModel::query()->insert([
            'code' => $commodity->code,
            'name' => $commodity->name,
            'uri' => $commodity->uri,
            'pop_up' => $commodity->popUp,
            'create_time' => Date("Y-m-d H:i:s")
        ]);
    }

    public function onDisable(Container $container, Extension $extension)
    {
        $key = $extension->name;
        $class = $this->goodList[$key];
        $commodity = new $class();

        StoreCommodityModel::query()->where('code', $commodity->code)->delete();
    }
}
