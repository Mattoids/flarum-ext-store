<?php

namespace Mattoid\Store\Controller;

use Askvortsov\AutoModerator\Api\Serializer\AutomoderatorDriversSerializer;
use Flarum\Api\Controller\AbstractListController;
use Mattoid\Store\Model\StoreCommodityModel;
use Mattoid\Store\Serializer\CommoditySerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Tobscure\JsonApi\Document;
use Flarum\User\UserRepository;

use Illuminate\Support\Arr;

class ListCommodityController extends AbstractListController
{

    /**
     * {@inheritdoc}
     */
    public $serializer = CommoditySerializer::class;

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

        $list = StoreCommodityModel::query()
            ->skip($offset)
            ->take($limit + 1)
            ->orderByDesc('create_time')
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
