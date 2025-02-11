<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Exception\PermissionDeniedException;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreGoodsModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\DataSerializer;
use Mattoid\Store\Utils\ObjectsUtil;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Foundation\ValidationException;
use Tobscure\JsonApi\Document;

/**
 * 编辑商品
 * Edit Goods
 */
class PutStoreController extends AbstractCreateController
{
    protected $url;
    protected $settings;
    protected $translator;
    protected $repository;

    /**
     * {@inheritdoc}
     */
    public $serializer = DataSerializer::class;
    private $storeTimezone = 'Asia/Shanghai';

    public function __construct(SettingsRepositoryInterface $settings, UserRepository $repository, UrlGenerator $url, Translator $translator)
    {
        $this->url = $url;
        $this->settings = $settings;
        $this->translator = $translator;
        $this->repository = $repository;

        $storeTimezone = $this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai');
        $this->storeTimezone = !!$storeTimezone ? $storeTimezone : 'Asia/Shanghai';    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $parseBody = $request->getParsedBody();
        $params = [];

        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $goods = StoreGoodsModel::query()->where('code', $parseBody['code'])->first();
        if (!$goods && $parseBody['status'] == 1) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
        }

        // 修改时库存为0则按照无限制逻辑处理
        if ($parseBody['stock'] == 0 || $parseBody['stock'] == -99) {
            $parseBody['stock'] = -99;
        }
        if (extension_loaded('bcmath')) {
            $discountPrice = bcdiv(bcmul($parseBody['price'], $parseBody['discount']) ,100, 2);
        } else {
            $discountPrice = round($parseBody['price'] * $parseBody['discount'] / 100, 2);
        }
        $parseBody['discountPrice'] = $discountPrice;
        $params = ObjectsUtil::removeEmptySql($parseBody);
        $params['pop_up'] = $goods->pop_up;
        $params['class_name'] = $goods->class_name;
        $params['updated_at'] = Carbon::now()->tz($this->storeTimezone);

        $result = StoreModel::query()->where('id', $parseBody['id'])->update($params);

        return $result;
    }
}
