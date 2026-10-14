<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Event\StoreBuyFailEvent;
use Mattoid\Store\Event\StoreCartAddEvent;
use Mattoid\Store\Event\StoreBuyEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\GoodsSerializer;
use Mattoid\Store\Service\StoreMoneyManager;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Tobscure\JsonApi\Document;

/**
 * 购买商品
 * Purchase goods
 */
class BuyGoodsController extends AbstractListController
{
    public $serializer = GoodsSerializer::class;

    protected $translator;
    protected $events;
    protected $cache;
    protected $log;
    protected $money;
    protected $connection;

    public function __construct(Dispatcher $events, Translator $translator, CacheContract $cache, LoggerInterface $log, StoreMoneyManager $money, ConnectionInterface $connection)
    {
        $this->events = $events;
        $this->translator = $translator;
        $this->cache = $cache;
        $this->log = $log;
        $this->money = $money;
        $this->connection = $connection;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getParsedBody();
        $id = Arr::get($params, 'id');

        // 验证是否有商店 查看/购买 权限
        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }
        // 游客无账户余额，不允许走购买流程
        if ($actor->isGuest()) {
            throw new PermissionDeniedException();
        }
        if (!$id) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        // 防连击锁：同一用户 5 秒内对同一商品的重复请求直接拒绝
        $key = md5("mattoid-store-buy-{$id}-{$actor->id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.request-processing')]);
        }

        try {
            return $this->connection->transaction(function () use ($actor, $params, $id) {
                return $this->purchase($actor, $params, $id);
            });
        } finally {
            $this->cache->delete($key);
        }
    }

    /**
     * 购买主流程（在数据库事务内执行，任一步失败整体回滚）
     */
    private function purchase($actor, array $params, $id)
    {
        $store = StoreModel::query()->where('id', $id)->where('status', 1)->first();
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.store-goods-non-existent')]);
        }
        if ($store->stock != StoreModel::STOCK_UNLIMITED && $store->stock <= 0) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')]);
        }
        if ($store->repeat == 0) {
            $storeCart = StoreCartModel::query()->where('user_id', $actor->id)->where('store_id', $store->id)
                ->where('status', 1)->where(function($where) {
                    $where->where(function($where) {
                        $where->where('type', 'limit')->where('outtime', '>=', Carbon::now());
                    });
                    $where->orWhere('type', 'permanent');
                })->first();
            if ($storeCart) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cannot-purchase-repeatedly')]);
            }
        }

        // 限购：开启后统计当前用户在限购周期内购买成功的次数，超限直接拒绝
        if ($store->purchase_limit_enable) {
            $periodSeconds = self::periodUnitToSeconds($store->purchase_limit_period_unit) * (int) $store->purchase_limit_period;
            if ($periodSeconds > 0 && $store->purchase_limit_count > 0) {
                $bought = StoreCartModel::query()->where('user_id', $actor->id)->where('store_id', $store->id)
                    ->where('status', 1)->where('created_at', '>=', Carbon::now()->subSeconds($periodSeconds))
                    ->count();
                if ($bought >= $store->purchase_limit_count) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.purchase-limit-exceeded')]);
                }
            }
        }

        $validate = StoreExtend::getValidate($store->code);
        if ($validate && !$validate->validate($actor, $store, $params)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        // 开始扣费：按折扣窗口计算应付金额（窗口起点为 discount_start_at，未设置的老数据回退 updated_at）
        $price = $store->price;
        $startAt = $store->discount_start_at ?: $store->updated_at;
        $endTime = $startAt ? Carbon::parse($startAt)->add($store->discount_limit, $store->discount_limit_unit)->getTimestamp() : 0;
        if ($store->discount_price > 0 && $store->discount > 0 && time() < $endTime) {
            $price = $store->discount_price;
        }

        if ($actor->money < $price) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        // 加入购物车 购物车会自动扣除库存
        $carts = $this->events->dispatch(new StoreCartAddEvent($actor, $store, $price));
        $cart = array_shift($carts);

        // 扣款交由资金管理器：优先 checkin-with-history 资金体系，未安装时回退原生 SQL
        $paid = $this->money->pay(
            $actor,
            $price,
            'STOREBUYGOODS',
            'mattoid-store.forum.money-history.buy-goods',
            ['title' => $store->title],
            $this->translator->trans('mattoid-store.forum.buy-goods', ['title' => $store->title]),
            $actor
        );
        if (!$paid) {
            // 扣费失败：库存回补 + 移除未扣费的购物车记录（同事务，不会留下半成品）
            $this->events->dispatch(new StoreStockAddEvent($store));
            $cart->delete();
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        // 处理商品插件后置事件
        $after = StoreExtend::getAfter($store->code);
        if ($after) {
            try {
                $afterResult = $after->after($actor, $store, $params);
            } catch (\Throwable $e) {
                $this->log->error('[mattoid-store] 商品后置处理失败，执行回滚', ['store' => $store->id, 'user' => $actor->id, 'exception' => $e]);
                $afterResult = false;
            }
            if (!$afterResult) {
                // 商品处理失败，通知购买失败事件进行回滚操作（退款 + 库存回补）
                $this->events->dispatch(new StoreBuyFailEvent($actor, $store, $cart, $params));
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.buy-goods-fail', ['title' => $store->title])]);
            }
        }

        // 通知购物车购买成功
        $cart->status = 1;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 通知其他插件购买完成
        $this->events->dispatch(new StoreBuyEvent($actor, $store, $cart, $params));

        return $store;
    }

    /**
     * 限购周期单位换算为秒（与 LimitUnitEnum 保持一致）
     */
    private static function periodUnitToSeconds($unit)
    {
        $map = ['days' => 86400, 'hour' => 3600, 'minute' => 60, 'second' => 1];
        return $map[$unit] ?? 0;
    }
}
