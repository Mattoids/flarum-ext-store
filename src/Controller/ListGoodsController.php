<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractListController;
use Flarum\Extension\ExtensionManager;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreGoodsModel;
use Mattoid\Store\Serializer\GoodsSerializer;
use Mattoid\Store\Utils\ExtensionIconUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Flarum\User\UserRepository;
use Flarum\Http\UrlGenerator;

/**
 * 获取可添加商品列表（管理端）
 * Get a list of products that can be added (on the management end)
 *
 * 数据源为运行时注册表（StoreExtend），不再读取 store_goods 数据表。
 * Data source is the runtime registry (StoreExtend), not the store_goods table.
 */
class ListGoodsController extends AbstractListController
{

    protected $url;
    protected $translator;
    protected $repository;
    protected $extensions;

    /**
     * {@inheritdoc}
     */
    public $serializer = GoodsSerializer::class;

    public function __construct(UserRepository $repository, UrlGenerator $url, Translator $translator, ExtensionManager $extensions)
    {
        $this->url = $url;
        $this->translator = $translator;
        $this->repository = $repository;
        $this->extensions = $extensions;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);

        if (!$actor->can('mattoid-store.group-view')) {
            throw new PermissionDeniedException();
        }

        $list = [];
        foreach (StoreExtend::getPlugins() as $code => $goods) {
            $model = new StoreGoodsModel();
            $model->code = $code;
            $model->name = $goods->name;
            $model->pop_up = $goods->popUp;
            $model->item_types = $goods->itemTypes;
            $model->icon = $goods->icon;
            $model->outtime = $goods->outtime;
            $model->purchase_limit_enable = $goods->purchaseLimitEnable;
            $model->purchase_limit_count = $goods->purchaseLimitCount;
            $model->purchase_limit_period = $goods->purchaseLimitPeriod;
            $model->purchase_limit_period_unit = $goods->purchaseLimitPeriodUnit;
            $model->usable = $goods->usable ? 1 : 0;
            $model->ext_icon = ExtensionIconUtil::resolve($goods, $this->extensions);
            $list[] = $model;
        }

        return collect($list);
    }

}
