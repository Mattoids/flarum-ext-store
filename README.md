# Flarum-ext-store

![License](https://img.shields.io/badge/license-LPL-1.02-blue.svg) [![Latest Stable Version](https://img.shields.io/packagist/v/mattoid/store.svg)](https://packagist.org/packages/mattoid/store) [![Total Downloads](https://img.shields.io/packagist/dt/mattoid/store.svg)](https://packagist.org/packages/mattoid/store)

A [Flarum](http://flarum.org) extension. store


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

## 帮助
### 注册商品事件
```php
    (new StoreExtend('商品的唯一KEY，不可与其他拓展重复'))
      // 注册商品信息
      ->addStoreGoods(InviteGoods::class)
      // 注册前置校验器
      ->addValidate(InviteValidate::class)
      // 注册商品的业务逻辑
      ->addAfter(InviteAfter::class)
```

### Event Introduction
- 购买前执行

  用户点击购买按钮后，优先执行`Mattoid\Store\Goods\Validate`，若要验证用户提交的表单或用户是否拥有商品权限则需要重写本类


- 购买后执行

  用户点击购买按钮后，本插件会自动验证用户资金、商品购买权限等。确认无误后执行`Mattoid\Store\Goods\After`类


- 商品信息`Mattoid\Store\Goods\Goods`

  注册产品信息（显示在管理端的添加产品页面上）

### Goods plugin
- [邀请码（审核版）](https://github.com/invites-fun/flarum-ext-store-invite)
- [补签卡](https://github.com/invites-fun/flarum-ext-store-check-in)

## Links

- [Packagist](https://packagist.org/packages/mattoid/store)
- [GitHub](https://github.com/mattoid/store)
- [Discuss](https://discuss.flarum.org/d/PUT_DISCUSS_SLUG_HERE)
