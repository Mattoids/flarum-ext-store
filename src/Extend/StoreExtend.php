<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;
use Mattoid\Store\Model\StoreCommodityModel;

class StoreExtend implements ExtenderInterface, LifecycleInterface
{

    protected $goodList = [];

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
        app('log')->info($extension->type);
        $storeCommodity = new StoreCommodityModel();
        $storeCommodity->code = $extension->name;
        $storeCommodity->save();
    }

    public function onDisable(Container $container, Extension $extension)
    {
        StoreCommodityModel::query()->where('code', $extension->name)->delete();
    }
}
