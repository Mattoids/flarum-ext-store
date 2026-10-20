<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Controller\Concerns\PaginatesQueries;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 获取商品列表
 * Get product list
 */
class ListStoreController extends AbstractListController
{
    use PaginatesQueries;

    protected $url;

    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

    public function __construct(UrlGenerator $url)
    {
        $this->url = $url;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getQueryParams();
        $type = Arr::get($params, 'filter.type');
        $status = Arr::get($params, 'filter.status');
        $code = Arr::get($params, 'filter.code');
        $subtype = Arr::get($params, 'filter.subtype');
        $group = Arr::get($params, 'filter.group');
        $discount = Arr::get($params, 'filter.discount');

        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        // 'trashed' 是回收站筛选：含软删行（前端恢复入口依赖）
        if ($status === 'trashed') {
            $query = StoreModel::withTrashed()->whereNotNull('deleted_at');
        } else {
            $query = StoreModel::query();
        }
        if ($type && $type != '-1') {
            $query->where('type', $type);
        }
        // '0' 是合法的筛选值（已下架），不能用真值判断；'trashed' 走回收站分支，不再按状态过滤
        if ($status !== null && $status !== '' && $status != '-1' && $status !== 'trashed') {
            $query->where('status', $status);
        }
        // 级联筛选：分组 / 商品插件 / 道具类型（插件自定义）/ 折扣
        if ($group && $group != '-1') {
            StoreExtend::filterByGroup($query, $group);
        }
        if ($code && $code != '-1') {
            $query->where('code', $code);
        }
        if ($subtype && $subtype != '-1') {
            $query->where('subtype', $subtype);
        }
        if ($discount === '1') {
            $query->where('discount', '>', 0);
        } elseif ($discount === '0') {
            $query->where('discount', 0);
        }

        $list = $query->orderByDesc('id');

        return $this->paginateList($list, $request, $document, 'store.list');
    }
}
