<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;
use Illuminate\Cache\RateLimiting\Limit;
use Mattoid\Store\Enum\LimitUnitEnum;

class UploadSerializer extends AbstractSerializer
{

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        return $data;
    }
}
