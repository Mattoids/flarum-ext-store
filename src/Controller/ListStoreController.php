<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
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
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);
        $type = Arr::get($params, 'filter.type');
        $status = Arr::get($params, 'filter.status');
        $code = Arr::get($params, 'filter.code');
        $subtype = Arr::get($params, 'filter.subtype');
        $group = Arr::get($params, 'filter.group');
        $discount = Arr::get($params, 'filter.discount');

        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        $query = StoreModel::query();
        if ($type && $type != '-1') {
            $query->where('type', $type);
        }
        if ($status && $status != '-1') {
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

        $list = $query
            ->skip($offset)
            ->take($limit + 1)
            ->orderByDesc('id')
            ->get();

        $results = $limit > 0 && $list->count() > $limit;
        if($results){
            $list->pop();
        }
        $document->addPaginationLinks(
            $this->url->to('api')->route('store.list'),
            $params,
            $offset,
            $limit,
            $results ? null : 0
        );

        return $list;
    }
}
