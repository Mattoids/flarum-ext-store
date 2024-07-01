<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Model\StoreGoodsIconModel;
use Mattoid\Store\Serializer\IconSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Tobscure\JsonApi\Document;
use Flarum\User\UserRepository;


class ListIconController extends AbstractListController
{

    /**
     * {@inheritdoc}
     */
    public $serializer = IconSerializer::class;

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

        $list = StoreGoodsIconModel::query()
            ->skip($offset)
            ->take($limit + 1)
            ->orderByDesc('created_at')
            ->get();

        $results = $limit > 0 && $list->count() > $limit;
        if($results){
            $list->pop();
        }
        $document->addPaginationLinks(
            $this->url->to('api')->route('store.icon.list'),
            $params,
            $offset,
            $limit,
            $results ? null : 0
        );

        return $list;
    }

}
