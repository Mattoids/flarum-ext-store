<?php

namespace Mattoid\Store\Upload;

use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Support\Str;
use Psr\Http\Message\UploadedFileInterface;

class StoreUploader{
    protected $uploadDir;

    public function __construct(Factory $filesystemFactory){
        $this->uploadDir = $filesystemFactory->disk('mattoid-store');
    }

    public function upload(UploadedFileInterface $file) {
        $ext = pathinfo($file->getClientFilename(), PATHINFO_EXTENSION);
        $filename = time()."_".Str::random().'.'.$ext;
        $stream = $file->getStream();
        $stream->rewind();

        $this->uploadDir->put($filename, $stream->getContents());

        /*
         * 只存根相对路径（/assets/mattoid/store/xxx），不存绝对 URL。
         * 绝对 URL 由磁盘配置的 url 生成，依赖请求时的 Host/协议头，
         * 经不同域名或缺少 Host 的请求上传会得到 http:// 之类的坏链并永久入库。
         */
        $path = parse_url($this->uploadDir->url($filename), PHP_URL_PATH);
        if (!$path || strpos($path, '/assets/') !== 0) {
            $path = '/assets/mattoid/store/'.$filename;
        }

        return $path;
    }

    public function getFileMd5(UploadedFileInterface $file)
    {
        $stream = $file->getStream();
        $stream->rewind();

        return md5($stream->getContents());
    }

    public function remove(string $filename){
        $fullFilename = $filename;

        if ($this->uploadDir->exists($fullFilename)) {
            $this->uploadDir->delete($fullFilename);
        }
    }
}
