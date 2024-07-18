<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use Illuminate\Support\Arr;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Serializer\CartSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListCartController extends AbstractListController
{

    /**
     * {@inheritdoc}
     */
    public $serializer = CartSerializer::class;

    public function __construct(UserRepository $repository, UrlGenerator $url, Translator $translator)
    {
        $this->url = $url;
        $this->translator = $translator;
        $this->repository = $repository;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getQueryParams();
        $limit = $this->extractLimit($request);
        $offset = $this->extractOffset($request);
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
        if ($status && $status != '-1') {
            $filter['status'] = $status;
        }
        if ($autoDeduction && $autoDeduction != '-1') {
            $filter['autoDeduction'] = $autoDeduction;
        }

        StoreCartModel::query()
            ->where('user_id', $actor->id)
            ->where($filter)
            ->skip($offset)
            ->take($limit + 1)
            ->orderByDesc('created_at')
            ->get();
    }
}
