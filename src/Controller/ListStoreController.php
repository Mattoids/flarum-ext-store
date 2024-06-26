<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListStoreController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

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

        $list = StoreModel::query()
            ->skip($offset)
            ->take($limit + 1)
            ->get();

        $results = $limit > 0 && $list->count() > $limit;
        if($results){
            $list->pop();
        }
        $document->addPaginationLinks(
            $this->url->to('api')->route('decorationStore.get'),
            $params,
            $offset,
            $limit,
            $results ? null : 0
        );

        return $list;
    }
}
