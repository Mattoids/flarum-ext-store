<?php

namespace Mattoid\Store\Attributes;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\User;

class UserAttributes
{
    public function __invoke(BasicUserSerializer $serializer, User $user) {
        $attributes = [];
        $actor = $serializer->getActor();

        $attributes['canStoreView'] = $actor->can('mattoid-store.group-view');

        return $attributes;
    }
}
