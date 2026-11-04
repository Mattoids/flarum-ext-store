<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Model\StoreCartModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

/**
 * 背包取消订阅（仅物主本人）
 * Cancel backpack subscription (owner only)
 *
 * 仅限时（type=limit，非永久）商品支持取消订阅：
 * 取消后关闭自动续费，商品到期由定时任务（mattoid:store:check:date）走失效流程，
 * 调用插件 invalid 钩子并置 status=9，背包列表只展示 status=1 记录，即自动从背包移除。
 */
class BackpackCancelSubscribeController extends AbstractCreateController
{
    public $serializer = DataSerializer::class;

    protected $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
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

        // 仅非永久（限时）商品支持取消订阅
        if ($cart->type !== 'limit') {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-not-subscribable')]);
        }

        $store = StoreModel::withTrashed()->where('id', $cart->store_id)->first();
        if (!$store || !$store->usable) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-no-use')]);
        }

        // 已取消过订阅：幂等成功，避免重复点击误报状态变化
        if (!$cart->auto_deduction) {
            $result = new \stdClass();
            $result->id = 'cancel-subscribe-result';
            $result->result = true;

            return $result;
        }

        // 条件更新并带 status 守卫：关闭自动续费，过期后不再扣款，由失效流程移除
        $affected = StoreCartModel::query()
            ->where('id', $cart->id)
            ->where('status', 1)
            ->update(['auto_deduction' => 0, 'updated_at' => Carbon::now()]);
        if (!$affected) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.cart-status-changed')]);
        }

        // JSON:API 序列化要求资源为对象且带 id
        $result = new \stdClass();
        $result->id = 'cancel-subscribe-result';
        $result->result = true;

        return $result;
    }
}
