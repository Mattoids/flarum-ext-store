<?php

namespace Mattoid\Store\Attributes;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Post\Post;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Symfony\Contracts\Translation\TranslatorInterface;

class
UserAttributes
{
    /**
     * @var SettingsRepositoryInterface|mixed
     */
    private $settings;

    /**
     * @var mixed|TranslatorInterface
     */
    private $translator;

    private $post;

    public function __construct()
    {
        $this->settings = resolve(SettingsRepositoryInterface::class);
        $this->translator = resolve(TranslatorInterface::class);
    }


    public function __invoke(BasicUserSerializer $serializer, User $user) {
        $attributes = [];
        $actor = $serializer->getActor();

        $canViewButton = $actor->can('mattoid-store.group-view');
        $attributes['canStoreView'] = $canViewButton;

        return $attributes;
    }
}
