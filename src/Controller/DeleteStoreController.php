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
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Foundation\ValidationException;
use Tobscure\JsonApi\Document;

/**
 * 从商店删除商品
 * Delete item from store
 */
class DeleteStoreController extends AbstractListController
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

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $result = StoreModel::query()->where('id', $parseBody['id'])->delete();

        return $result;
    }
}
