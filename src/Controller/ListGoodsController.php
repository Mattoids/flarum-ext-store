<?php

namespace Mattoid\Store\Controller;

use Askvortsov\AutoModerator\Api\Serializer\AutomoderatorDriversSerializer;
use Flarum\Api\Controller\AbstractListController;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Model\StoreGoodsModel;
use Mattoid\Store\Serializer\GoodsSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Tobscure\JsonApi\Document;
use Flarum\User\UserRepository;

use Illuminate\Support\Arr;

class ListGoodsController extends AbstractListController
{

    /**
     * {@inheritdoc}
     */
    public $serializer = GoodsSerializer::class;

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

        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        $list = StoreGoodsModel::query()
            ->skip($offset)
            ->take($limit + 1)
            ->orderByDesc('created_at')
            ->get();

        $results = $limit > 0 && $list->count() > $limit;
        if($results){
            $list->pop();
        }
        $document->addPaginationLinks(
            $this->url->to('api')->route('store.goods.list'),
            $params,
            $offset,
            $limit,
            $results ? null : 0
        );

        return $list;
    }

}
