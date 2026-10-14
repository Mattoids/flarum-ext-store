<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractDeleteController;
use Flarum\Http\RequestUtil;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Model\StoreModel;
use Psr\Http\Message\ServerRequestInterface;

/**
 * 从商店删除商品（软删除，保留历史购买记录可回溯）
 */
class DeleteStoreController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = RequestUtil::getActor($request);
        $id = $request->getParsedBody()['id'] ?? null;

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $store = StoreModel::query()->find($id);
        if ($store) {
            $store->delete();
        }
    }
}
