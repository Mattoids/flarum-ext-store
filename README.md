# Flarum-ext-store

![License](https://img.shields.io/badge/license-LPL-1.02-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/mattoid/store.svg)](https://packagist.org/packages/mattoid/store) [![Total Downloads](https://img.shields.io/packagist/dt/mattoid/store.svg)](https://packagist.org/packages/mattoid/store)

A [Flarum](http://flarum.org) extension. store 

[中文](https://github.com/Mattoids/flarum-ext-store/blob/master/docs/readme_cn.md)


## Installation

Install with composer:

```sh
composer require mattoid/flarum-ext-store:"*"
```

## Updating

```sh
composer update mattoid/flarum-ext-store:"*"
php flarum migrate
php flarum cache:clear
```


## Help
### Register Product Events
```php
(new StoreExtend('Unique KEY of the product, must not overlap with other extensions'))
  // Register product information
  ->addStoreGoods(Goods::class)
  // Register pre-validation
  ->addValidate(Validate::class)
  // Register business logic of the product
  ->addAfter(After::class)
  // Product invalidation logic
  ->addInvalid(Invalid::class);
```

### Product Events Overview
- Executed before purchase

  When a user clicks the purchase button, `Mattoid\Store\Goods\Validate` is executed first. If validation of user-submitted forms or user permission for the product is required, this class needs to be overridden.

- Executed after purchase

  After a user clicks the purchase button, this plugin automatically verifies user funds, product purchase permissions, etc. Upon confirmation, `Mattoid\Store\Goods\After` class is executed.

  An event `Mattoid\Store\Event\StoreBuyEvent` is triggered after the operation completes.

- Executed when product becomes invalid (payment failure)

  Use the `php flarum schedule:run` command to periodically check for invalid products. If the product has automatic payment deduction enabled, only deduction (without inventory operations) occurs. If automatic deduction is not enabled or fails, `Mattoid\Store\Goods\Invalid` class is executed.

  An event `Mattoid\Store\Event\StoreInvalidEvent` is triggered after the operation completes.

- Product Information

  Register product information (displayed on the admin's add product page) by overriding and registering the `Mattoid\Store\Goods\Goods` class.

## Event Introduction
All events are not transaction-managed; they notify other plugins before code execution ends without interception or similar processing. For transactional atomicity, use `Mattoid\Store\Extend\StoreExtend` class for registration, treating all capabilities registered by this class as proprietary business logic of this plugin.
(For example: If funds are insufficient, `Mattoid\Store\Event\StoreBuyEvent` and subsequent logic of `Mattoid\Store\Goods\After` are not executed; refund and inventory increase occur automatically if `Mattoid\Store\Goods\After` execution fails.)

Events typically do not require special handling by product plugins. This plugin recommends using `Mattoid\Store\Extend\StoreExtend` class for business logic registration.

### Purchase Failure Event
`Mattoid\Store\Event\StoreBuyFailEvent`

This event is listened to by this plugin. Notify this event if a rollback of purchase information is needed due to failed proprietary business logic execution by the product plugin. This plugin handles inventory and refund operations automatically.
(Not needed if using `Mattoid\Store\Extend\StoreExtend` to register product business logic.)

### Purchase Notification Event
`Mattoid\Store\Event\StoreBuyEvent`

This event is listened to by the product plugin itself to indicate the end of a purchase. Product plugins can perform post-purchase operations.

### Add to Cart
`Mattoid\Store\Event\StoreCartAddEvent`

This event is listened to by this plugin. Product plugins can implement add to cart operations via this event (automatically deducting inventory).

### Edit Cart
`Mattoid\Store\Event\StoreCartEditEvent`

This event is listened to by this plugin. Product plugins can implement cart editing operations via this event (increasing inventory if `status` is greater than 1).

### Rollback Inventory
`Mattoid\Store\Event\StoreStockAddEvent`

This event is listened to by this plugin. Product plugins can implement inventory rollback operations via this event.

### Deduct Inventory
`Mattoid\Store\Event\StoreStockSubEvent`

This event is listened to by this plugin. Product plugins can implement inventory deduction operations via this event.

### Product Invalidation Event
`Mattoid\Store\Event\StoreInvalidEvent`

This event is listened to by the product plugin and is triggered when a product becomes invalid (regardless of successful payment deduction).

### Product Plugins
- [Invitation Code (Audit Version)](https://github.com/Mattoids/flarum-ext-store-invite)
- [Check-in Card](https://github.com/Mattoids/flarum-ext-store-check-in)
- [Auto Check-in Card](https://github.com/Mattoids/flarum-ext-store-auto-check-in)



## Links

- [Packagist](https://packagist.org/packages/mattoid/store)
- [GitHub](https://github.com/mattoid/store)
- [Discuss](https://discuss.flarum.org/d/PUT_DISCUSS_SLUG_HERE)
