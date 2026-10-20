# Flarum-ext-store

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Mattoids/flarum-ext-store/master/LICENSE.md) [![Latest Stable Version](https://img.shields.io/packagist/v/mattoid/flarum-ext-store.svg)](https://packagist.org/packages/mattoid/flarum-ext-store) [![Total Downloads](https://img.shields.io/packagist/dt/mattoid/flarum-ext-store.svg)](https://packagist.org/packages/mattoid/flarum-ext-store)

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

> ⚠️ **升级后不可仅回退代码**：`2026_10_14` 重构迁移会把存量时间数据从 Asia/Shanghai 墙钟换算为 UTC。若新版出问题，必须连同数据库一起回退（或先用 `mysqldump` 备份），只回退代码会让全部到期时间偏移 8 小时。
>
> 另注意：存量购物车的 `auto_deduction` 列为 0，开启自动续费的商品其已购未过期道具到期时走失效而非自动续费，用户重新购买后即恢复正常；如需立即生效可对 `status=1` 且未过期的购物车按商品设置做一次 backfill。

## Permissions

| Permission key | Scope | Description |
| --- | --- | --- |
| `mattoid-store.group-view` | Everyone / Members (allow guests optional) | View the store and purchase goods |
| `mattoid-store.group-moderate` | Mods / Admins | View all purchase records and manage goods/icons in the admin area |

Note: `mattoid-store.group-admin-view` is defined by the companion extension `mattoid/flarum-ext-store-invite`, not by this extension.

## Scheduling

The extension registers a scheduled command that expires time-limited goods and processes renewals (`mattoid:store:check:date`, every five minutes, output appended to `storage/logs/mattoid-store.log`). Flarum's scheduler requires a system cron entry:

```cron
* * * * * php /path/to/flarum schedule:run >> /dev/null 2>&1
```

Without this cron, time-limited goods will not expire automatically.


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
  ->addInvalid(Invalid::class)
  // Product usage logic
  ->addEnable(Enable::class);
```

> 📖 **Product Plugin Development Guide**: A complete step-by-step guide for developing store product plugins — project scaffolding, the `Goods` information class (including optional form defaults like validity / purchase limit), the five registration capabilities, admin form extension points, frontend component registration, and i18n conventions:
> [English](docs/goods-plugin-dev_en.md) · [中文](docs/goods-plugin-dev_cn.md)

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

- Use Product
- 
  Register product usage logic, add `use/cancel` buttons on the shopping cart interface, and notify product processing events when the user clicks the button.

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

- [Packagist](https://packagist.org/packages/mattoid/flarum-ext-store)
- [GitHub](https://github.com/mattoids/flarum-ext-store)
- [Discuss](https://discuss.flarum.org/d/34793)
- [中文文档](https://github.com/Mattoids/flarum-ext-store/blob/master/docs/readme_cn.md)
- [Product Plugin Development Guide (EN)](https://github.com/Mattoids/flarum-ext-store/blob/master/docs/goods-plugin-dev_en.md)
- [商品插件开发指南 (中文)](https://github.com/Mattoids/flarum-ext-store/blob/master/docs/goods-plugin-dev_cn.md)
