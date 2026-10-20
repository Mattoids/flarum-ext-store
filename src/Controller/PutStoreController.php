<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Mattoid\Store\Service\IconRefCountService;
use Mattoid\Store\Utils\StoreParamsUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 编辑商品
 * Edit Goods
 */
class PutStoreController extends AbstractCreateController
{
    protected $translator;
    protected $iconRefCount;

    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

    public function __construct(Translator $translator, IconRefCountService $iconRefCount)
    {
        $this->translator = $translator;
        $this->iconRefCount = $iconRefCount;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $parseBody = $request->getParsedBody();

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $id = Arr::get($parseBody, 'id');
        if (!$id) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-params')]);
        }

        $store = StoreModel::query()->find($id);
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        $status = (int) Arr::get($parseBody, 'status', 1);
        $code = Arr::get($parseBody, 'code');
        // 插件校验以运行时注册表为准；下架操作允许类型已注销（插件停用后商品自动下架，但管理员仍可编辑/下架）
        $goods = $code ? StoreExtend::getStoreGoods($code) : null;
        if (!$goods && $status == 1) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        // 白名单过滤 + 参数校验（防止批量赋值注入与负价格刷钱）
        $params = StoreParamsUtil::sanitizeForWrite($parseBody, false);
        unset($params['code']); // 商品类型不允许变更
        if ($goods) {
            $params['pop_up'] = json_encode($goods->popUp);
            $params['class_name'] = $goods->className;
        }

        // 价格或折扣任一变化都要重算折扣价；仅当 discount 变化时重启折扣窗口
        // （只改价格不重开窗口，避免进行中的折扣被意外刷新或已过期折扣复活）
        if (array_key_exists('price', $params) || array_key_exists('discount', $params)) {
            $price = $params['price'] ?? $store->price;
            $discount = $params['discount'] ?? $store->discount;
            $params['discount_price'] = StoreParamsUtil::calcDiscountPrice($price, $discount);
        }
        if (array_key_exists('discount', $params)) {
            $params['discount_start_at'] = $params['discount'] > 0 ? Carbon::now() : null;
        }

        $oldIcon = $store->icon;
        $store->update($params);

        // 更换图标时释放旧图标引用（与上传接口的 increment('count') 对应）
        if (array_key_exists('icon', $params) && $params['icon'] !== $oldIcon) {
            $this->iconRefCount->release($oldIcon);
        }

        return $store->refresh();
    }
}
