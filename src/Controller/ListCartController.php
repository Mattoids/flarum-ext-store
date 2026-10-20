<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Controller\Concerns\PaginatesQueries;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Serializer\CartSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListCartController extends AbstractListController
{
    use PaginatesQueries;

    protected $url;

    /**
     * {@inheritdoc}
     */
    public $serializer = CartSerializer::class;

    public function __construct(UrlGenerator $url)
    {
        $this->url = $url;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getQueryParams();
        $type = Arr::get($params, 'filter.type');
        $status = Arr::get($params, 'filter.status');
        $autoDeduction = Arr::get($params, 'filter.autoDeduction');
        $filter = [];

        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        if ($type) {
            $filter['type'] = $type;
        }
        if ($status !== '' && $status !== null && $status != '-1') {
            $filter['status'] = $status;
        }
        if ($autoDeduction && $autoDeduction != '-1') {
            $filter['auto_deduction'] = $autoDeduction;
        }

        $list = StoreCartModel::query()
            ->where('user_id', $actor->id)
            ->where($filter)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        return $this->paginateList($list, $request, $document, 'store.cart.list');
    }
}
