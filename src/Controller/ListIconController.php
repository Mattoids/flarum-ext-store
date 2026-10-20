<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Controller\Concerns\PaginatesQueries;
use Mattoid\Store\Model\StoreGoodsIconModel;
use Mattoid\Store\Serializer\IconSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Tobscure\JsonApi\Document;

/**
 * 获取商品图标列表（管理端使用）
 * Get a list of product icons (for management purposes)
 */
class ListIconController extends AbstractListController
{
    use PaginatesQueries;

    protected $url;

    /**
     * {@inheritdoc}
     */
    public $serializer = IconSerializer::class;

    public function __construct(UrlGenerator $url)
    {
        $this->url = $url;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);

        // 图标库仅管理端使用，要求管理权限
        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $list = StoreGoodsIconModel::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        return $this->paginateList($list, $request, $document, 'store.icon.list');
    }

}
