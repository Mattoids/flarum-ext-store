<?php

namespace Mattoid\Store\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Locale\Translator;

class DataSerializer extends AbstractSerializer
{
    protected $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    protected function getDefaultAttributes($data) {
        if (is_object($data)) {
            return get_object_vars($data);
        }
        return is_array($data) ? $data : [];
    }
}
