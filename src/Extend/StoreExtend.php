<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;

class StoreExtend implements ExtenderInterface, LifecycleInterface
{

    protected $goodList = [];

    public function addStoreGoods(string $key, $callback): self
    {
        app('log')->info($key);
        $this->goodList[$key] = $callback;
        return $this;
    }

    public function extend(Container $container, Extension $extension = null)
    {
        app('log')->info("extend");
    }


    public function onEnable(Container $container, Extension $extension)
    {
        app('log')->info("onEnable");
    }

    public function onDisable(Container $container, Extension $extension)
    {
        app('log')->info("onDisable");
    }
}
