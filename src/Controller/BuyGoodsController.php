<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Foundation\ValidationException;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Events\Dispatcher;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\UserRepository;
use Illuminate\Support\Arr;
use Flarum\User\User;
use Mattoid\Store\Event\StoreBuyFailEvent;
use Mattoid\Store\Event\StoreCartAddEvent;
use Mattoid\Store\Event\StoreBuyEvent;
use Mattoid\Store\Event\StoreCartEditEvent;
use Mattoid\Store\Event\StoreStockAddEvent;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Mattoid\Store\Serializer\GoodsSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class BuyGoodsController extends AbstractListController
{
    public $serializer = GoodsSerializer::class;

    protected $translator;
    protected $settings;
    protected $events;
    protected $cache;


    public function __construct(SettingsRepositoryInterface $settings, UserRepository $repository, Dispatcher $events, Translator $translator, CacheContract $cache)
    {
        $this->cache = $cache;
        $this->events = $events;
        $this->settings = $settings;
        $this->translator = $translator;
        $this->repository = $repository;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getParsedBody();
        $id = Arr::get($params, 'id');

        // 验证是否有商店 查看/购买 权限
        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        $store = StoreModel::query()->where('id', $id)->where('status', 1)->first();
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.store-goods-non-existent')]);
        }
        if ($store->stock != -99 && $store->stock <= 0) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.insufficient-inventory')]);
        }
        if ($store->repeat == 0) {
            $storeCart = StoreCartModel::query()->where('user_id', $actor->id)->where('store_id', $store->id)
                ->where('status', 1)->where(function($where) {
                    $where->where(function($where) {
                        $where->where('type', 'limit')->where('outtime', '>=', Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai')));
                    });
                    $where->orWhere('type', 'permanent');
                })->first();
            if ($storeCart) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cannot-purchase-repeatedly')]);
            }
        }

        $validate = StoreExtend::getValidate($store->code);
        if ($validate && !$validate->validate($actor, $store, $params, $this->translator, $this->settings, $this->events, $this->cache)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        $user = User::query()->where('id', $actor->id)->first();
        // 开始扣费
        $price = $store->price;
        // 计算折扣
        $time = time();
        $endTime = Carbon::parse($store->updated_at)->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'))->modify('+' . $store->discount_limit . ' ' . $store->discount_limit_unit)->getTimestamp();
        if ($store->discount_price > 0 && $store->discount > 0 && $time < $endTime) {
            $price = $store->discount_price;
        }

        $money = $user->money;
        $balance = $money - $price;
        if ($balance < 0) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        // 加入购物车 购物车会自动扣除库存
        $carts = $this->events->dispatch(new StoreCartAddEvent($user, $store, $price));
        $cart = array_shift($carts);

        $user->money = $balance;
        $user->where('money', $money);
        if (!$user->save()) {
            // 扣费失败则累加库存
            $carts = $this->events->dispatch(new StoreStockAddEvent($store));
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.user-balance-low')]);
        }

        // 通知资金消费记录插件
        if (class_exists('Mattoid\MoneyHistory\Event\MoneyHistoryEvent')) {
            $this->events->dispatch(new \Mattoid\MoneyHistory\Event\MoneyHistoryEvent($user, -$price, 'STOREBUYGOODS', $this->translator->trans("mattoid-store.forum.buy-goods", ['title' => $store->title]), ''));
        }

        // 处理商品插件后置事件
        $after = StoreExtend::getAfter($store->code);
        if ($after) {
            // 商品处理失败，通知购买失败事件进行回滚操作
            if (!$after->after($actor, $store, $params, $this->translator, $this->settings, $this->events, $this->cache)) {
                $this->events->dispatch(new StoreBuyFailEvent($user, $store, $cart, $params));
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.buy-goods-fail', ['title' => $store->title])]);
            }
        }

        // 通知购物车购买成功
        $cart->status = 1;
        $this->events->dispatch(new StoreCartEditEvent($cart));

        // 通知其他插件购买完成
        $this->events->dispatch(new StoreBuyEvent($user, $store, $cart, $params));

        return $store;
    }
}
