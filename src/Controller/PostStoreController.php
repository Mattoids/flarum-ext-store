<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreCommodityModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Foundation\ValidationException;
use Tobscure\JsonApi\Document;

class PostStoreController extends AbstractListController
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

        $commodity = StoreCommodityModel::query()->where('code', $parseBody['code'])->first();
        if (!$commodity) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        $result = StoreModel::query()->insert([
            'code' => $parseBody['code'],
            'title' => $parseBody['title'],
            'uri' => $commodity->uri,
            'pop_up' => $commodity->pop_up,
            'price' => $parseBody['price'],
            'stock' => $parseBody['stock'],
            'discount' => $parseBody['discount'],
            'discount_limit' => $parseBody['limit'],
            'discount_limit_unit' => $parseBody['limitUnit'],
            'type' => $parseBody['type'],
            'outtime' => $parseBody['outtime'],
            'icon' => $parseBody['icon'],
            'hide' => $parseBody['hide'],
            'desc' => $parseBody['desc'],
        ]);

        return $result;
    }
}
