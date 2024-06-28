<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreCommodityModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Mattoid\Store\Utils\ObjectsUtil;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Foundation\ValidationException;
use Tobscure\JsonApi\Document;

class PutStoreController extends AbstractListController
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
        $parseBody = $request->getParsedBody();
        $params = [];

        $commodity = StoreCommodityModel::query()->where('code', $parseBody['code'])->first();
        if (!$commodity && $parseBody['status'] == 1) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        $params = ObjectsUtil::removeEmptySql($parseBody);
        $params['uri'] = $commodity->uri;
        $params['pop_up'] = $commodity->pop_up;
        $params['updated_at'] = Carbon::now();
        
        $result = StoreModel::query()->where('id', $parseBody['id'])->update($params);

        return $result;
    }
}
