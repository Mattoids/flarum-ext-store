# Flarum-ext-store

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Mattoids/flarum-ext-store/master/LICENSE.md) [![Latest Stable Version](https://img.shields.io/packagist/v/mattoid/flarum-ext-store.svg)](https://packagist.org/packages/mattoid/flarum-ext-store) [![Total Downloads](https://img.shields.io/packagist/dt/mattoid/flarum-ext-store.svg)](https://packagist.org/packages/mattoid/flarum-ext-store)

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
  ->addStoreGoods(Goods::class)
  // 注册前置校验器
  ->addValidate(Validate::class)
  // 注册商品的业务逻辑
  ->addAfter(After::class)
  // 商品失效逻辑
  ->addInvalid(Invalid::class)
  // 注册商品使用逻辑
  ->addEnable(Enable::class);
```

### 商品事件简介
- 购买前执行

  用户点击购买按钮后，优先执行`Mattoid\Store\Goods\Validate`，若要验证用户提交的表单或用户是否拥有商品权限则需要重写该类


- 购买后执行

  用户点击购买按钮后，本插件会自动验证用户资金、商品购买权限等。确认无误后执行`Mattoid\Store\Goods\After`类。

  操作完成后通知事件 `Mattoid\Store\Event\StoreBuyEvent`


- 商品失效（扣费失败）时执行

  通过 `php flarum  schedule:run` 命令定时查询失效商品，若商品开启自动扣费选项，则直接扣费（仅扣费不操作库存）。
  若为开启自动扣费或扣费失败则执行 `Mattoid\Store\Goods\Invalid` 类。

  操作完成后通知事件 `Mattoid\Store\Event\StoreInvalidEvent`


- 商品信息

  注册商品信息（显示在管理端的添加商品页面上），用户需要重写并注册 `Mattoid\Store\Goods\Goods` 类。

- 使用商品

  注册商品使用逻辑，在购物车界面增加`使用/取消`按钮，在用户点击按钮时通知商品处理事件。


## 事件介绍
所有事件均不受事务管理，仅在代码结束前通知其他插件，不做任何拦截等处理。若要想实现事务原子性，
请使用 `Mattoid\Store\Extend\StoreExtend` 类进行注册，该类注册的所有能力均视为本插件自有业务逻辑。
(例如：余额不足时，不执行 `Mattoid\Store\Event\StoreBuyEvent` 以及之后的逻辑；`Mattoid\Store\Goods\After` 执行失败时自动退款并增加库存)

事件通常不需要商品插件做特殊处理，本插件推荐使用 `Mattoid\Store\Extend\StoreExtend` 类的方式进行业务逻辑注册

### 购买失败事件
`Mattoid\Store\Event\StoreBuyFailEvent`

该事件由本插件监听，若商品插件执行自有业务逻辑失败导致需要回滚购买信息时可通知该事件，本插件会自动处理库存以及退款等操作
（若使用 `Mattoid\Store\Extend\StoreExtend` 注册的商品业务逻辑，则不需要考虑该事件。）

### 购买通知事件
`Mattoid\Store\Event\StoreBuyEvent`

该事件由商品插件自行监听，用于通知商品插件购买结束，商品插件可执行购买后的操作

### 添加购物车
`Mattoid\Store\Event\StoreCartAddEvent`

该事件由本插件监听，商品插件可通过通知该事件实现添加购物车的操作(该事件会自动减扣库存)

### 编辑购物车
`Mattoid\Store\Event\StoreCartEditEvent`

该事件由本插件监听，商品插件可通过通知该事件实现编辑购物车的操作(若 `status` 大于1，则该事件会自动增加库存)

### 回滚库存
`Mattoid\Store\Event\StoreStockAddEvent`

该事件由本插件监听，商品插件可通过通知该事件实现库存回滚操作

### 扣除库存
`Mattoid\Store\Event\StoreStockSubEvent`

该事件由本插件监听，商品插件可通过通知该事件实现库存减扣操作

### 商品失效事件
`Mattoid\Store\Event\StoreInvalidEvent`

该事件由商品插件监听，在商品失效时便会通知该事件（无论是否扣款成功）




### 商品插件
- [邀请码（审核版）](https://github.com/Mattoids/flarum-ext-store-invite)
- [补签卡](https://github.com/Mattoids/flarum-ext-store-check-in)
- [自动签到卡](https://github.com/Mattoids/flarum-ext-store-auto-check-in)


## Links

- [Packagist](https://packagist.org/packages/mattoid/flarum-ext-store)
- [GitHub](https://github.com/mattoids/flarum-ext-store)
- [Discuss](https://discuss.flarum.org/d/34793)
