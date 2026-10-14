<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 使用商品（购物车条目启用/停用，仅管理员/物主按权限判定）
 */
class UseGoodsController extends AbstractCreateController
{
    protected $translator;
    protected $cache;

    /**
     * {@inheritdoc}
     */
    public $serializer = DataSerializer::class;

    public function __construct(Translator $translator, CacheContract $cache)
    {
        $this->translator = $translator;
        $this->cache = $cache;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $params = $request->getParsedBody();
        $id = Arr::get($params, 'id');

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        if (!$id) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        // 防连击锁，避免并发下商品效果被重复执行
        $key = md5("mattoid-store-use-{$id}-{$actor->id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.request-processing')]);
        }

        try {
            return DB::transaction(function () use ($actor, $id) {
                $cart = StoreCartModel::query()->where('id', $id)->where('user_id', $actor->id)->first();
                if (!$cart) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
                }

                $enable = StoreExtend::getEnable($cart->code);
                if (!$enable) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
                }
                $store = StoreModel::query()->where('id', $cart->store_id)->first();
                if (!$store) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
                }

                // 翻转 enable 后以「目标状态」调用插件钩子，失败则整体回滚
                $cart->enable = !$cart->enable;
                if (!$enable::enable($actor, $store, $cart)) {
                    throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
                }

                $cart->save();

                // JSON:API 序列化要求资源为对象且带 id
                $result = new \stdClass();
                $result->id = 'use-result';
                $result->result = true;

                return $result;
            });
        } finally {
            $this->cache->delete($key);
        }
    }
}
