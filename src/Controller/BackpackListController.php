<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\BackpackItemSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 背包列表（当前登录用户，分页）
 * Backpack list (current user, paginated)
 *
 * 统一返回两个来源的已购道具：
 * - store：主商店购买记录（status=1），含使用方式与剩余件数
 * - 其他扩展通过 StoreExtend::addBackpackProvider 接入（如装饰店物品）
 */
class BackpackListController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = BackpackItemSerializer::class;

    protected $url;

    public function __construct(UrlGenerator $url)
    {
        $this->url = $url;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $params = $request->getQueryParams();
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);

        if ($actor->isGuest() || !$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }
        $userId = $actor->id;

        $items = [];

        // 主商店：已支付购买记录
        $carts = StoreCartModel::query()
            ->where('user_id', $userId)
            ->where('status', 1)
            ->orderByDesc('id')
            ->get();

        if ($carts->isNotEmpty()) {
            // 包含已软删除商品，保证背包图标/信息仍可展示
            $stores = StoreModel::withTrashed()
                ->whereIn('id', $carts->pluck('store_id')->all())
                ->get()
                ->keyBy('id');

            // 只有商品行标记「允许使用」（store.usable = 1）的商品才进背包；
            // 不允许使用的商品购买后直接生效，不在背包展示。
            // 新增商品时 usable 的表单默认值来自商品插件 Goods 抽象类的 $usable 声明。
            $usableStoreIds = $stores->filter(function ($store) {
                return (int) $store->usable === 1;
            })->keys()->all();
            $carts = $carts->filter(function ($cart) use ($usableStoreIds) {
                return in_array($cart->store_id, $usableStoreIds, true);
            })->values();

            // 每个商品的剩余件数（status=1 的购买记录数）
            $remaining = StoreCartModel::query()
                ->where('user_id', $userId)
                ->where('status', 1)
                ->whereIn('store_id', $usableStoreIds)
                ->select('store_id')
                ->selectRaw('count(*) as cnt')
                ->groupBy('store_id')
                ->pluck('cnt', 'store_id');

            foreach ($carts as $cart) {
                $store = $stores->get($cart->store_id);

                $item = new \stdClass();
                $item->id = 'store-' . $cart->id;
                $item->source = 'store';
                $item->refId = $cart->id;
                $item->code = $cart->code;
                $item->storeId = $cart->store_id;
                $item->title = $cart->title;
                $item->icon = $store ? $store->icon : '';
                $item->useType = $store ? $store->use_type : 'permanent';
                $item->subtype = $store ? $store->subtype : null;
                $item->type = $cart->type;
                $item->outtime = $cart->outtime;
                $item->autoDeduction = $cart->auto_deduction;
                $item->enable = (int) $cart->enable;
                $item->remaining = (int) ($remaining[$cart->store_id] ?? 0);
                $item->createdAt = $cart->created_at;
                $items[] = $item;
            }
        }

        // 扩展接入的背包条目（装饰店等）
        foreach (StoreExtend::getBackpackProviders() as $provider) {
            foreach ((array) $provider($userId) as $item) {
                $items[] = $item;
            }
        }

        // 按获得时间倒序合并后分页
        usort($items, function ($a, $b) {
            return strtotime($b->createdAt) <=> strtotime($a->createdAt);
        });

        $total = count($items);
        $page = array_slice($items, $offset, $limit > 0 ? $limit + 1 : null);
        $hasMore = $limit > 0 && count($page) > $limit;
        if ($hasMore) {
            $page = array_slice($page, 0, $limit);
        }

        $document->addPaginationLinks(
            $this->url->to('api')->route('store.backpack.list'),
            $params,
            $offset,
            $limit,
            $hasMore ? null : 0
        );

        return collect($page);
    }
}
