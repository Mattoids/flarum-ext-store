<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 恢复软删除的商品
 * Restore a soft-deleted product
 */
class RestoreStoreController extends AbstractCreateController
{
    protected $translator;

    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        $id = $request->getParsedBody()['id'] ?? null;

        if (! $actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $store = StoreModel::withTrashed()->find($id);
        if (! $store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }
        if (! $store->trashed()) {
            return $store;
        }

        $store->restore();

        // 恢复的商品默认回到下架状态，避免误删商品直接重新上架
        if ($store->status == 1) {
            $store->status = 0;
            $store->save();
        }

        return $store->refresh();
    }
}
