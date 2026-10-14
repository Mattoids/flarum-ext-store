<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use Illuminate\Support\Arr;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Mattoid\Store\Utils\StoreParamsUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 添加商品
 * Add Goods
 */
class PostStoreController extends AbstractCreateController
{
    protected $translator;

    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

    public function __construct(UserRepository $repository, Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $parseBody = $request->getParsedBody();

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $code = Arr::get($parseBody, 'code');
        // 插件校验以运行时注册表为准，不查询 store_goods 数据表
        $goods = $code ? StoreExtend::getStoreGoods($code) : null;
        if (!$goods) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        // 白名单过滤 + 参数校验（防止批量赋值注入与负价格刷钱）
        $params = StoreParamsUtil::sanitizeForWrite($parseBody, true);
        $params['pop_up'] = json_encode($goods->popUp);
        $params['class_name'] = $goods->className;
        $params['discount_price'] = StoreParamsUtil::calcDiscountPrice($params['price'], $params['discount'] ?? 0);
        // 折扣窗口起点：有折扣时从创建时刻开始计时
        $params['discount_start_at'] = ($params['discount'] ?? 0) > 0 ? Carbon::now() : null;

        return StoreModel::query()->create($params);
    }
}
