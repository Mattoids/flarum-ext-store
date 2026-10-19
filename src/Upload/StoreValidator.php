<?php
namespace Mattoid\Store\Upload;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\AvatarValidator;
use Illuminate\Validation\Factory;
use Intervention\Image\Exception\NotReadableException;
use Intervention\Image\ImageManager;
use Psr\Http\Message\UploadedFileInterface;
use Symfony\Component\Mime\MimeTypes;
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
        $this->assertFileMimes($attributes['file']);
        $this->assertFileSize($attributes['file']);
    }

    /**
     * 与父类的差异：图标允许 webm 视频，Intervention 图片内容校验只对 image/* 生效，
     * 视频流无法被 Intervention 解析，跳过（MIME 白名单已拦截可执行文件伪装）。
     */
    protected function assertFileMimes(UploadedFileInterface $file)
    {
        $allowedTypes = $this->getAllowedTypes();

        $phpExtensions = ['php', 'php3', 'php4', 'php5', 'phtml'];
        $fileExtension = pathinfo($file->getClientFilename(), PATHINFO_EXTENSION);

        if (in_array(trim(strtolower($fileExtension)), $phpExtensions)) {
            $this->raise('mimes', [':values' => implode(', ', $allowedTypes)]);
        }

        $mediaType = $file->getClientMediaType();
        $guessedExtension = MimeTypes::getDefault()->getExtensions($mediaType)[0] ?? null;

        if (!in_array($guessedExtension, $allowedTypes)) {
            $this->raise('mimes', [':values' => implode(', ', $allowedTypes)]);
        }

        if (strpos($mediaType, 'image/') === 0) {
            try {
                $this->imageManager->make($file->getStream()->getMetadata('uri'));
            } catch (NotReadableException $_e) {
                $this->raise('image');
            }
        }
    }

    protected function getAllowedTypes(){
        return ['png','jpeg','jpg', 'webm'];
    }

    protected function getMaxSize(){
        return 4096;
    }
}
