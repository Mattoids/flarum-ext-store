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

        return $this->uploadDir->url($filename);
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
