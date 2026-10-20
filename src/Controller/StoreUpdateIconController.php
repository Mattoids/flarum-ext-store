<?php

namespace Mattoid\Store\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Support\Arr;
use Mattoid\Store\Model\StoreGoodsIconModel;
use Mattoid\Store\Serializer\DataSerializer;
use Mattoid\Store\Upload\StoreUploader;
use Mattoid\Store\Upload\StoreValidator;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Database\QueryException;

/**
 * 上传图标
 * upload icon
 */
class StoreUpdateIconController extends AbstractCreateController{
    public $serializer = DataSerializer::class;
    public $include = ['store'];
    protected $uploader;
    protected $validator;
    protected $translator;

    public function __construct(StoreUploader $uploader, StoreValidator $validator, Translator $translator){
        $this->uploader = $uploader;
        $this->validator = $validator;
        $this->translator = $translator;
    }

    protected function data(ServerRequestInterface $request, Document $document){
        $actor = RequestUtil::getActor($request);
        if (!$actor->can('mattoid-store.group-moderate')) {
            throw new PermissionDeniedException();
        }

        $result = [];
        $file = Arr::get($request->getUploadedFiles(), 'file');

        $this->validator->assertValid(['file' => $file]);

        $uuid = $this->uploader->getFileMd5($file);

        // 同一文件（md5 相同）直接复用已有记录并增加引用计数，不产生重复文件
        $existing = StoreGoodsIconModel::query()->where('uuid', $uuid)->first();
        if ($existing) {
            $existing->increment('count');
            return ['id' => $existing->id, 'path' => $existing->url];
        }

        // 先上传文件再落库：落库失败（如并发同文件上传撞唯一索引）只遗留孤儿文件，
        // 不再产生 url=null 的孤儿行；且 md5 不会被未完成的行永久占位
        $path = $this->uploader->upload($file);

        $icon = new StoreGoodsIconModel();
        $icon->uuid = $uuid;
        $icon->count = 1;
        $icon->url = $path;
        try {
            $icon->save();
        } catch (QueryException $e) {
            // 并发同文件上传：后到者撞唯一索引时复用既有记录并增加引用计数，而非误报"文件已存在"
            $existing = StoreGoodsIconModel::query()->where('uuid', $uuid)->first();
            if ($existing) {
                $existing->increment('count');
                return ['id' => $existing->id, 'path' => $existing->url];
            }
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.file-exist')]);
        }

        $result['id'] = $icon->id;
        $result['path'] = $icon->url;
        return $result;
    }
}
