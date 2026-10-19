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

        $icon = new StoreGoodsIconModel();
        $icon->uuid = $this->uploader->getFileMd5($file);
        try {
            $icon->save();
        } catch (QueryException $e) {
            throw new ValidationException(['message' => $this->translator->trans('mattoid-store.forum.error.file-exist')]);
        }

        $icon->increment('count');

        $icon->url = $this->uploader->upload($file);
        $icon->save();

        $result['id'] = $icon->id;
        $result['path'] = $icon->url;
        return $result;
    }
}
