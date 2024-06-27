<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractListController;
use Flarum\Http\RequestUtil;
use Flarum\Http\UrlGenerator;
use Flarum\Locale\Translator;
use Flarum\User\UserRepository;
use Mattoid\Store\Model\StoreCommodityModel;
use Mattoid\Store\Model\StoreModel;
use Mattoid\Store\Serializer\StoreSerializer;
use Psr\Http\Message\ServerRequestInterface;
use Flarum\Foundation\ValidationException;
use Tobscure\JsonApi\Document;

class PutStoreController extends AbstractListController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = StoreSerializer::class;

    public function __construct(UserRepository $repository, UrlGenerator $url, Translator $translator)
    {
        $this->url = $url;
        $this->translator = $translator;
        $this->repository = $repository;
    }

    protected function data(ServerRequestInterface $request, Document $document) {
        $actor = RequestUtil::getActor($request);
        $parseBody = $request->getParsedBody();

        if ($parseBody['status'] == 1) {
            $commodity = StoreCommodityModel::query()->where('code', $parseBody['code'])->first();
            if (!$commodity) {
                throw new ValidationException(['message' => $this->translator->trans('mattoid-store.admin.error.invalid-product')]);
            }
        }

        $result = StoreModel::query()->where('id', $parseBody['id'])->update([
            'code' => $parseBody['code'],
            'title' => $parseBody['title'],
            'uri' => $commodity->uri,
            'pop_up' => $commodity->pop_up,
            'price' => $parseBody['price'],
            'stock' => $parseBody['stock'],
            'status' => $parseBody['status'],
            'discount' => $parseBody['discount'] || 0,
            'discount_limit' => $parseBody['limit'] || 0,
            'discount_limit_unit' => $parseBody['limitUnit'] || 'day',
            'type' => $parseBody['type'],
            'outtime' => $parseBody['outtime'] || 0,
            'icon' => $parseBody['icon'] || '',
            'hide' => $parseBody['hide'],
            'desc' => $parseBody['desc'] ? $parseBody['desc'] : '',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        return $result;
    }
}
