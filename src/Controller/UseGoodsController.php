<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use Illuminate\Support\Arr;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 从商店删除商品
 * Delete item from store
 */
class UseGoodsController extends AbstractCreateController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = DataSerializer::class;

    public function __construct(UserRepository $repository, UrlGenerator $url, Translator $translator)
    {
        $this->url = $url;
        $this->translator = $translator;
        $this->repository = $repository;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getParsedBody();
        $id = Arr::get($params, 'id');

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $cart = StoreCartModel::query()->where('id', $id)->where('user_id', $actor->id)->first();
        $enable = StoreExtend::getEnable($cart->code);
        if (!$enable) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
        }
        $store = StoreModel::query()->where('id', $cart->store_id)->first();
        if (!$enable::enable($actor, $store, $cart)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
        }

        $cart->enable = !$cart->enable;
        $result = $cart->save();

        return $result;
    }
}
