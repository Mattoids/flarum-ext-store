<?php

namespace Mattoid\Store\Controller;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Support\Arr;
use Mattoid\Store\Model\StoreGoodsIconModel;
use Mattoid\Store\Serializer\UploadSerializer;
use Mattoid\Store\Upload\StoreUploader;
use Mattoid\Store\Upload\StoreValidator;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Illuminate\Database\QueryException;

class StoreUpdateIconController extends AbstractCreateController{
    public $serializer = UploadSerializer::class;
    public $include = ['store'];
    protected $settings;
    protected $translator;

    public function __construct(SettingsRepositoryInterface $settings, StoreUploader $uploader, StoreValidator $validator, Translator $translator){
        $this->uploader = $uploader;
        $this->settings = $settings;
        $this->validator = $validator;
        $this->translator = $translator;
    }

    protected function data(ServerRequestInterface $request, Document $document){
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

        $result['path'] = $url = $this->uploader->upload($file);

        $icon->increment('count');

        $icon->url = $url;
        $icon->created_at = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));
        $icon->updated_at = Carbon::now()->tz($this->settings->get('mattoid-store.storeTimezone', 'Asia/Shanghai'));
        $icon->save();

        return $result;
    }
}
