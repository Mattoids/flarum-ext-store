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

/**
 * 商品注册处理类
 * Product registration processing class
 */
class StoreExtend implements ExtenderInterface, LifecycleInterface
{

    private $key = '';
    private static $goodList = [];
    private static $afterList = [];
    private static $validateList = [];
    private static $invalidList = [];
    private static $enableList = [];


    public function __construct(string $key = '')
    {
        $this->key = $key;
        $this->settings = resolve(SettingsRepositoryInterface::class);
        $this->translator = resolve(TranslatorInterface::class);
    }

    /**
     * 注册商品信息
     * Registered product information
     *
     * @param $callback 回调方法    Callback method
     * @return $this
     */
    public function addStoreGoods($callback): self
    {
        StoreExtend::$goodList[$this->key] = $callback;
        return $this;
    }

    /**
     * 注册前置验证
     * Pre registration verification
     *
     * @param $callback
     * @return $this
     */
    public function addValidate($callback): self
    {
        StoreExtend::$validateList[$this->key] = $callback;
        return $this;
    }

    /**
     * 注册购买成功后处理逻辑
     * Processing logic after successful registration and purc
     *
     * @param $callback
     * @return $this
     */
    public function addAfter($callback): self
    {
        StoreExtend::$afterList[$this->key] = $callback;
        return $this;
    }

    /**
     * 注册商品失效处理逻辑
     * Registration product invalidation processing logic
     *
     * @param $callback
     * @return $this
     */
    public function addInvalid($callback): self
    {
        StoreExtend::$invalidList[$this->key] = $callback;
        return $this;
    }

    /**
     * 注册商品使用功能
     *
     * @param String $key
     * @return mixed|null
     */
    public function addEnable($callback): self
    {
        StoreExtend::$enableList[$this->key] = $callback;
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

    public static function getEnable(String $key)
    {
        if (array_key_exists($key, StoreExtend::$enableList_)) {
            $class = StoreExtend::$enableList[$key];
            return new $class;
        }
        return null;
    }

    public function extend(Container $container, Extension $extension = null)
    {
    }


    /**
     * 开启插件时触发
     * Trigger when opening plugin
     *
     * @param Container $container
     * @param Extension $extension
     * @return void
     */
    public function onEnable(Container $container, Extension $extension)
    {
        // 添加商品信息到数据库
        // Add product information to the database
        $goods = StoreExtend::getStoreGoods($this->key);
        if ($goods) {
            StoreGoodsModel::query()->insert([
                'code' => $this->key,
                'name' => $goods->name,
                'class_name' => $goods->className,
                'pop_up' => json_encode($goods->popUp),
                'created_at' => Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai') ?? 'Asia/Shanghai')
            ]);
        }
    }

    /**
     * 关闭插件触发
     * Close plugin trigger
     *
     * @param Container $container
     * @param Extension $extension
     * @return void
     */
    public function onDisable(Container $container, Extension $extension)
    {
        // 插件关闭自动下架对应商品
        StoreModel::query()->where('code', $this->key)->update(['status' => 0]);
        // 插件关闭自动移除可上架商品
        StoreGoodsModel::query()->where('code', $this->key)->delete();
    }
}
