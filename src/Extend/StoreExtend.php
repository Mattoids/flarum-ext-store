<?php

namespace Mattoid\Store\Extend;

use Carbon\Carbon;
use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Container\Container;
use Mattoid\Store\Model\StoreGoodsModel;
use Mattoid\Store\Model\StoreModel;
use Symfony\Contracts\Translation\TranslatorInterface;

class StoreExtend implements ExtenderInterface, LifecycleInterface
{

    private $key = '';
    private static $goodList = [];
    private static $afterList = [];
    private static $validateList = [];
    private static $invalidList = [];


    public function __construct(string $key = '')
    {
        $this->key = $key;
        $this->settings = resolve(SettingsRepositoryInterface::class);
        $this->translator = resolve(TranslatorInterface::class);
    }

    public function addStoreGoods($callback): self
    {
        StoreExtend::$goodList[$this->key] = $callback;
        return $this;
    }

    public function addValidate($callback): self
    {
        StoreExtend::$validateList[$this->key] = $callback;
        return $this;
    }

    public function addAfter($callback): self
    {
        StoreExtend::$afterList[$this->key] = $callback;
        return $this;
    }

    public function addInvalid($callback): self
    {
        StoreExtend::$invalidList[$this->key] = $callback;
        return $this;
    }

    public static function getStoreGoods(String $key)
    {
        if (array_key_exists($key, StoreExtend::$goodList)) {
            $class = StoreExtend::$goodList[$key];
            return new $class;
        }
        return null;
    }

    public static function getValidate(String $key)
    {
        if (array_key_exists($key, StoreExtend::$validateList)) {
            $class = StoreExtend::$validateList[$key];
            return new $class;
        }
        return null;
    }

    public static function getAfter(String $key)
    {
        if (array_key_exists($key, StoreExtend::$afterList)) {
            $class = StoreExtend::$afterList[$key];
            return new $class;
        }
        return null;
    }

    public static function getInvalid(string $key)
    {
        if (array_key_exists($key, StoreExtend::$invalidList)) {
            $class = StoreExtend::$invalidList[$key];
            return new $class;
        }
        return null;
    }

    public function extend(Container $container, Extension $extension = null)
    {
    }


    public function onEnable(Container $container, Extension $extension)
    {
        $goods = StoreExtend::getStoreGoods($this->key);
        if ($goods) {
            StoreGoodsModel::query()->insert([
                'code' => $this->key,
                'name' => $goods->name,
                'class_name' => $goods->className,
                'pop_up' => json_encode($goods->popUp),
                'created_at' => Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'))
            ]);
        }
    }

    public function onDisable(Container $container, Extension $extension)
    {
        // 插件关闭自动下架对应商品
        StoreModel::query()->where('code', $this->key)->update(['status' => 0]);
        // 插件关闭自动移除可上架商品
        StoreGoodsModel::query()->where('code', $this->key)->delete();
    }
}
