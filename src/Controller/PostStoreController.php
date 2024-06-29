<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreGoodsModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Mattoid\Store\Utils\ObjectsUtil;
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
        $params = [];

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $goods = StoreGoodsModel::query()->where('code', $parseBody['code'])->first();
        if (!$goods) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        // 修改时库存为0则按照无限制逻辑处理
        if ($parseBody['stock'] == 0 || $parseBody['stock'] == -99) {
            $parseBody['stock'] = -99;
        }
        if (extension_loaded('bcmath')) {
            $discountPrice = bcdiv(bcmul($parseBody['price'], $parseBody['discount']) ,100, 2);
        } else {
            $discountPrice = round($parseBody['price'] * $parseBody['discount'] / 100, 2);
        }
        $parseBody['discountPrice'] = $discountPrice;
        $params = ObjectsUtil::removeEmptySql($parseBody);
        $params['pop_up'] = $goods->pop_up;
        $params['class_name'] = $goods->class_name;
        $params['created_at'] = Carbon::now();
        $params['updated_at'] = Carbon::now();


        $result = StoreModel::query()->insert($params);

        return $result;
    }
}
