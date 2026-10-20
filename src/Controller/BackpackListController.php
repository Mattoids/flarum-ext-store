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

        // 先取扩展条目（数量有界），其数量决定购物车主查询需要多取多少，
        // 保证 offset 作用在合并排序后的完整列表上，而不是只作用于购物车子集
        foreach (StoreExtend::getBackpackProviders() as $provider) {
            foreach ((array) $provider($userId) as $item) {
                $items[] = $item;
            }
        }
        $providerCount = count($items);

        // 主商店：已支付购买记录（不跳过 offset——offset 在合并后统一施加；
        // 多取 providerCount 条，确保合并列表 offset..offset+limit 窗口内的购物车记录一定被取到）
        $carts = StoreCartModel::query()
            ->where('user_id', $userId)
            ->where('status', 1)
            // 只有商品行标记「允许使用」（store.usable = 1）的商品才进背包；
            // 不允许使用的商品购买后直接生效，不在背包展示。
            // 新增商品时 usable 的表单默认值来自商品插件 Goods 抽象类的 $usable 声明。
            ->whereIn('store_id', StoreModel::withTrashed()->where('usable', 1)->select('id'))
            // created_at 主排序 + id 决胜：不依赖 id 与创建时间单调一致的假设
            // （手工改库/导入数据可能导致高 createdAt 低 id 的记录被漏取）
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take($limit > 0 ? $offset + $limit + $providerCount + 1 : 100000)
            ->get();

        // 购物车是否还有未取到的记录（取满说明后面可能还有，用于 hasMore 的保守判断）
        $cartsExhausted = $limit <= 0 || $carts->count() < $offset + $limit + $providerCount + 1;

        if ($carts->isNotEmpty()) {
            // 包含已软删除商品，保证背包图标/信息仍可展示
            $stores = StoreModel::withTrashed()
                ->whereIn('id', $carts->pluck('store_id')->all())
                ->get()
                ->keyBy('id');

            // 每个商品的剩余件数（status=1 的购买记录数）
            $remaining = StoreCartModel::query()
                ->where('user_id', $userId)
                ->where('status', 1)
                ->whereIn('store_id', $carts->pluck('store_id')->unique()->all())
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

        // 按获得时间倒序合并后统一施加 offset/limit（两个来源都参与分页，不再漏条目）
        usort($items, function ($a, $b) {
            return strtotime($b->createdAt) <=> strtotime($a->createdAt);
        });

        $hasMore = false;
        if ($limit > 0) {
            $hasMore = !$cartsExhausted || count($items) > $offset + $limit;
            $items = array_slice($items, $offset, $limit);
        }

        $document->addPaginationLinks(
            $this->url->to('api')->route('store.backpack.list'),
            $params,
            $offset,
            $limit,
            $hasMore ? null : 0
        );

        return collect($items);
    }
}
