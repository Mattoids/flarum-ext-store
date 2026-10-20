<?php

namespace Mattoid\Store\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extend\LifecycleInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Facades\Log;
use Mattoid\Store\Model\StoreModel;

/**
 * 商品注册处理类
 * Product registration processing class
 */
class StoreExtend implements ExtenderInterface, LifecycleInterface
{
    /** 钩子类型常量（内部注册表 key） */
    const TYPE_GOODS = 'goods';
    const TYPE_VALIDATE = 'validate';
    const TYPE_AFTER = 'after';
    const TYPE_INVALID = 'invalid';
    const TYPE_ENABLE = 'enable';
    const TYPE_USE = 'use';

    private $key = '';

    /** @var array [钩子类型 => [code => 类名]] */
    private static $registry = [];

    /** @var array [钩子类型 => [code => 实例]] 实例缓存，避免每次 get 都 new */
    private static $instances = [];

    /** @var callable[] 背包条目提供者 */
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
        return $this->add(self::TYPE_GOODS, $callback);
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
        return $this->add(self::TYPE_VALIDATE, $callback);
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
        return $this->add(self::TYPE_AFTER, $callback);
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
        return $this->add(self::TYPE_INVALID, $callback);
    }

    /**
     * 注册商品使用功能
     *
     * @param $callback
     * @return $this
     */
    public function addEnable($callback): self
    {
        return $this->add(self::TYPE_ENABLE, $callback);
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
        return $this->add(self::TYPE_USE, $callback);
    }

    private function add(string $type, $callback): self
    {
        // 同一 code 重复注册时后者覆盖前者，记录日志以便排障
        if (isset(self::$registry[$type][$this->key])) {
            Log::warning("[mattoid-store] store extend '{$this->key}' of type '{$type}' re-registered, previous registration overwritten");
        }
        self::$registry[$type][$this->key] = $callback;
        unset(self::$instances[$type][$this->key]);
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
        foreach (array_keys(self::$registry[self::TYPE_GOODS] ?? []) as $key) {
            $plugin = self::get(self::TYPE_GOODS, $key);
            // 类加载失败的插件跳过，避免调用方对 null 解引用
            if ($plugin) {
                $plugins[$key] = $plugin;
            }
        }
        return $plugins;
    }

    public static function getStoreGoods(String $key)
    {
        return self::get(self::TYPE_GOODS, $key);
    }

    public static function getValidate(String $key)
    {
        return self::get(self::TYPE_VALIDATE, $key);
    }

    public static function getAfter(String $key)
    {
        return self::get(self::TYPE_AFTER, $key);
    }

    public static function getInvalid(string $key)
    {
        return self::get(self::TYPE_INVALID, $key);
    }

    public static function getEnable(String $key)
    {
        return self::get(self::TYPE_ENABLE, $key);
    }

    public static function getUse(String $key)
    {
        return self::get(self::TYPE_USE, $key);
    }

    /**
     * 统一取值入口：按类型从注册表取类名并缓存实例
     */
    private static function get(string $type, string $key)
    {
        if (!isset(self::$registry[$type][$key])) {
            return null;
        }
        if (!isset(self::$instances[$type][$key])) {
            $class = self::$registry[$type][$key];
            // 注册类自动加载失败时不实例化（避免延迟到业务中途才爆 500），记日志并视为未注册
            if (!class_exists($class)) {
                Log::warning("[mattoid-store] store extend class '{$class}' (key '{$key}', type '{$type}') not found, treated as unregistered");
                return null;
            }
            self::$instances[$type][$key] = new $class;
        }
        return self::$instances[$type][$key];
    }

    /**
     * 分组过滤（商店列表 / 级联筛选共用）：
     * store.group 直接匹配，或为 NULL 且其插件声明的分组等于目标分组（继承）
     */
    public static function filterByGroup($query, string $group): void
    {
        $inherited = [];
        foreach (self::getPlugins() as $code => $goods) {
            if (($goods->group ?: 'default') === $group) {
                $inherited[] = $code;
            }
        }

        $query->where(function ($q) use ($group, $inherited) {
            $q->where('group', $group);
            if (count($inherited)) {
                $q->orWhere(function ($qq) use ($inherited) {
                    $qq->whereNull('group')->whereIn('code', $inherited);
                });
            }
        });
    }

    public function extend(Container $container, Extension $extension = null)
    {
    }


    /**
     * 开启插件时触发
     * Trigger when opening plugin
     *
     * 商品插件注册不再写入 store_goods 数据表，注册表（registry）即唯一事实源。
     * Goods plugin registration no longer writes to the store_goods table;
     * the runtime registry is the single source of truth.
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
