<?php
namespace Mattoid\Store\Upload;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\AvatarValidator;
use Illuminate\Validation\Factory;
use Intervention\Image\ImageManager;
use Symfony\Contracts\Translation\TranslatorInterface;

class StoreValidator extends AvatarValidator{
    protected $config;

    public function __construct(Factory $validator, TranslatorInterface $translator, ImageManager $imageManager, SettingsRepositoryInterface $config){
        parent::__construct($validator, $translator, $imageManager);
        $this->config = $config;
    }

    protected function getRules(): array{
        return [
            'file' => [
                'required',
                'max:'.$this->getMaxSize(),
            ],
        ];
    }

    public function assertValid(array $attributes){
        $this->laravelValidator = $this->makeValidator($attributes);

        $this->assertFileRequired($attributes['file']);
//        $this->assertFileMimes($attributes['file']);
        $this->assertFileSize($attributes['file']);
    }

    protected function getAllowedTypes(){
        return ['png','jpeg','jpg', 'webm'];
    }

    protected function getMaxSize(){
        return 4096;
    }
}
