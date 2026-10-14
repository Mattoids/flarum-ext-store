<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;
use Mattoid\Store\Model\StoreModel;

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
    private static $useList = [];
    private static $backpackProviderList = [];

    public function __construct(string $key = '')
    {
        $this->key = $key;
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

    /**
     * 注册一次性道具（consumable）的使用逻辑
     * Register consumable goods use logic
     *
     * 回调类需实现静态方法：use(User $actor, StoreModel $store, StoreCartModel $cart): bool
     * 返回 false 视为使用失败，购买记录不会被消耗。
     *
     * @param $callback
     * @return $this
     */
    public function addUse($callback): self
    {
        StoreExtend::$useList[$this->key] = $callback;
        return $this;
    }

    /**
     * 注册背包条目提供者（ Backpack provider ）
     *
     * 提供者签名：function (int $userId): array，返回 BackpackItemSerializer 约定的 stdClass 条目数组。
     * 用于将其他扩展（如装饰店）的物品接入背包列表，避免硬编码耦合。
     *
     * @param callable $provider
     * @return $this
     */
    public function addBackpackProvider(callable $provider): self
    {
        StoreExtend::$backpackProviderList[] = $provider;
        return $this;
    }

    /**
     * 获取全部背包条目提供者
     *
     * @return callable[]
     */
    public static function getBackpackProviders(): array
    {
        return self::$backpackProviderList;
    }

    /**
     * 获取全部已注册的商品插件（运行时注册表，唯一事实源）
     * Get all registered goods plugins (runtime registry, single source of truth)
     *
     * @return array [code => Goods 实例]
     */
    public static function getPlugins(): array
    {
        $plugins = [];
        foreach (array_keys(self::$goodList) as $key) {
            $plugins[$key] = self::getStoreGoods($key);
        }
        return $plugins;
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
        if (array_key_exists($key, StoreExtend::$enableList)) {
            $class = StoreExtend::$enableList[$key];
            return new $class;
        }
        return null;
    }

    public static function getUse(String $key)
    {
        if (array_key_exists($key, StoreExtend::$useList)) {
            $class = StoreExtend::$useList[$key];
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
     * 商品插件注册不再写入 store_goods 数据表，注册表（static $goodList）即唯一事实源。
     * Goods plugin registration no longer writes to the store_goods table;
     * the runtime registry (static $goodList) is the single source of truth.
     *
     * @param Container $container
     * @param Extension $extension
     * @return void
     */
    public function onEnable(Container $container, Extension $extension)
    {
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
    }
}
