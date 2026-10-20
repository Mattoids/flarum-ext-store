<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Contracts\Cache\Repository as CacheContract;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 背包使用商品（仅物主本人）
 * Use backpack goods (owner only)
 *
 * - permanent（永久道具）：使用/取消使用，调用插件 enable 钩子
 * - consumable（一次性道具）：调用插件 use 钩子，成功后消耗一条购买记录（status=3）
 */
class BackpackUseController extends AbstractCreateController
{
    public $serializer = DataSerializer::class;

    protected $translator;
    protected $cache;
    protected $connection;

    public function __construct(Translator $translator, CacheContract $cache, ConnectionInterface $connection)
    {
        $this->translator = $translator;
        $this->cache = $cache;
        $this->connection = $connection;
    }

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = RequestUtil::getActor($request);
        if ($actor->isGuest()) {
            throw new PermissionDeniedException();
        }

        $id = Arr::get($request->getParsedBody(), 'id');
        if (!$id) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.validate-fail')]);
        }

        $cart = StoreCartModel::query()
            ->where('id', $id)
            ->where('user_id', $actor->id)
            ->where('status', 1)
            ->first();
        if (!$cart) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
        }

        // 不限制商品上下架状态：已持有（含赠送）的道具即便商品下架/软删也应可正常使用
        $store = StoreModel::withTrashed()->where('id', $cart->store_id)->first();
        if (!$store) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.store-goods-non-existent')]);
        }
        // usable=0 的商品购买时直接生效、不进背包，不允许再通过背包触发权益（防止重复发放）
        if (! $store->usable) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
        }

        // 防连击锁，避免并发下效果被重复执行/重复消耗
        $key = md5("mattoid-store-backpack-use-{$cart->store_id}-{$actor->id}");
        if (!$this->cache->add($key, time(), 5)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.request-processing')]);
        }

        try {
            return $this->connection->transaction(function () use ($actor, $store, $cart) {
                if ($store->use_type === 'consumable') {
                    $this->consume($actor, $store, $cart);
                } else {
                    $this->toggle($actor, $store, $cart);
                }

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

    /**
     * 永久道具：使用/取消使用（调用插件 enable 钩子）
     */
    private function toggle($actor, $store, $cart)
    {
        $enable = StoreExtend::getEnable($cart->code);
        if (!$enable) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
        }

        // 翻转 enable 后以「目标状态」调用插件钩子，失败则整体回滚
        $cart->enable = !$cart->enable;
        if (!$enable::enable($actor, $store, $cart)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
        }
        // 只条件更新 enable 列并带 status 守卫，避免 stale 模型全行写回把已失效记录复活
        $affected = StoreCartModel::query()
            ->where('id', $cart->id)
            ->where('status', 1)
            ->update(['enable' => $cart->enable, 'updated_at' => Carbon::now()]);
        if (!$affected) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-status-changed')]);
        }
    }

    /**
     * 一次性道具：消耗传入的这条购买记录（调用插件 use 钩子）
     */
    private function consume($actor, $store, $cart)
    {
        $use = StoreExtend::getUse($cart->code);
        if (!$use) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
        }

        // 行锁锁住传入记录并复查状态，防止并发重复消耗（与校验的是同一条，语义一致）
        $target = StoreCartModel::query()
            ->where('id', $cart->id)
            ->where('status', 1)
            ->lockForUpdate()
            ->first();
        if (!$target) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
        }

        if (!$use::use($actor, $store, $target)) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-use-fail')]);
        }

        // 使用成功：该购买记录标记为已使用，背包库存随之 -1
        $target->status = 3;
        $target->save();
    }
}
