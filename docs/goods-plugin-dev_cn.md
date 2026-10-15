# 商品插件开发文档（flarum-ext-store）

> 适用版本：flarum-ext-store `fix/security-stability-20261010` 分支之后的版本。
> 本文档面向**商品插件**开发者，介绍如何基于 store 扩展开发一个商品插件。
> English version: [goods-plugin-dev_en.md](goods-plugin-dev_en.md)

---

## 1. 架构变化（升级版核心）

旧版：商品插件启用时把商品信息写入 `store_goods` 数据表，store 依赖数据库行判断插件是否存在。

新版：**运行时注册表是唯一事实源**。商品插件通过 `Mattoid\Store\Extend\StoreExtend` 在 `extend.php` 中注册，注册信息保存在内存静态注册表中：

- 不再读写 `store_goods` 表（该表已废弃，保留仅为兼容，请勿使用）。
- 插件被**禁用**时，store 会自动把该插件（按注册 key）对应的商品全部下架（`status=0`）。
- 管理端「添加商品」弹窗直接从注册表读取插件列表，无需任何数据库初始化。

---

## 2. 最小可运行示例

### 2.1 目录结构

```
flarum-ext-my-goods/
├── composer.json
├── extend.php
├── locale/
│   └── zh-Hans.yml
└── src/
    └── Goods/
        ├── MyGoods.php       // 商品信息（必须）
        ├── MyValidate.php    // 购买前校验（可选）
        ├── MyAfter.php       // 购买后业务（可选）
        ├── MyInvalid.php     // 失效/过期处理（可选）
        └── MyUse.php         // 一次性道具使用逻辑（可选）
```

### 2.2 extend.php 注册

```php
<?php

use Flarum\Extend;
use Mattoid\Store\Extend\StoreExtend;
use Mattoid\StoreMyGoods\Goods\MyGoods;
use Mattoid\StoreMyGoods\Goods\MyValidate;
use Mattoid\StoreMyGoods\Goods\MyAfter;
use Mattoid\StoreMyGoods\Goods\MyInvalid;

return [
    new Extend\Locales(__DIR__.'/locale'),

    // 'my-goods' 是商品的唯一 KEY（= 商品 code），全局不可重复
    (new StoreExtend('my-goods'))
        ->addStoreGoods(MyGoods::class)   // 商品信息（必填，其余均可选）
        ->addValidate(MyValidate::class)  // 购买前校验
        ->addAfter(MyAfter::class)        // 购买成功后业务逻辑
        ->addInvalid(MyInvalid::class),   // 商品失效/扣费失败时逻辑
];
```

### 2.3 商品信息类

```php
<?php

namespace Mattoid\StoreMyGoods\Goods;

use Mattoid\Store\Goods\Goods;

class MyGoods extends Goods
{
    // 商品名称：翻译键，展示时经 translator 转换
    public $name = 'my-goods.forum.title';

    // 购买弹窗里的动态表单描述符（可选，见 3.3 节）
    public $popUp = [
        [
            'label'    => 'my-goods.forum.email',      // 翻译键：字段标题
            'prop'     => 'input',                      // 元素类型：input/switch/textarea/select
            'type'     => 'email',                      // input 的 type 属性
            'value'    => 'email',                      // 提交参数的 key
            'helpText' => 'my-goods.forum.email-help',  // 翻译键：字段下方说明
        ],
    ];

    // 道具类型声明（可选）：用于商店筛选栏「道具类型」维度与管理端 subtype 下拉
    public $itemTypes = [
        ['key' => 'month', 'name' => 'my-goods.admin.item-type-month'],
        ['key' => 'year',  'name' => 'my-goods.admin.item-type-year'],
    ];

    // 分组声明（可选）：用于商店筛选栏「分组」维度，留空 = 默认分组。
    // 值为翻译键；商品（store 行）可在后台覆盖分组，未覆盖时继承此声明。
    public $group = 'my-goods.group-vip';

    // 插件 logo 图片地址（可选）：管理端商品卡片/列表无图标时的回退显示，
    // 如 '/assets/extensions/my-goods/logo.svg'。不填则回退到扩展 composer.json 声明的 icon。
    public $icon = '';

    // 以下为表单默认值声明（全部可选，null = 不预设，用管理端表单默认）：
    // 有效期天数（对应表单「有效期」）
    public $outtime = null;
    // 是否开启限购 0/1（对应表单「开启限购」开关）
    public $purchaseLimitEnable = null;
    // 每周期限购数量（对应表单「限购数量」）
    public $purchaseLimitCount = null;
    // 限购周期数值，0 = 终身限购（对应表单「限购周期」）
    public $purchaseLimitPeriod = null;
    // 限购周期单位：days/hour/minute/second（对应表单「周期单位」）
    public $purchaseLimitPeriodUnit = null;

    // 商品是否允许被使用（可选，默认 false = 不允许）：
    // 只有声明为 true 的商品才会出现在用户背包中（可装备/使用）；
    // false 的商品购买后直接生效，不进背包。
    public $usable = false;

    // 购买弹窗样式类名（可选）
    public $className = 'store-buy Modal--small';
}
```

> **注意**：基类中 `$name`、`$popUp`、`$className` 默认为 `protected`，子类中**必须用 `public` 重新声明**（如上例），否则注册表读取不到。

---

## 3. 注册能力详解

### 3.1 addStoreGoods（必填）

注册商品信息类，管理端「添加商品」弹窗据此展示插件卡片（名称、logo、itemTypes 标签）。

### 3.2 addValidate（可选）

购买前校验。校验失败时抛异常即可阻止购买：

```php
<?php

namespace Mattoid\StoreMyGoods\Goods;

use Flarum\User\User;
use Mattoid\Store\Goods\Validate;
use Mattoid\Store\Model\StoreModel;

class MyValidate extends Validate
{
    public static function validate(User $user, StoreModel $store, $params)
    {
        if (!$user->can('my-goods.group-buy')) {
            throw new \Flarum\User\Exception\PermissionDeniedException();
        }
        if (empty($params['email'])) {
            throw new \Flarum\Foundation\ValidationException([
                'email' => '邮箱不能为空',
            ]);
        }
        return true;
    }
}
```

### 3.3 购买弹窗动态表单（popUp）

`Goods::$popUp` 是描述符数组，store 购买弹窗（StoreBox）按此动态渲染表单，提交时以 `value` 为 key 随购买请求一起提交给 `addValidate` / `addAfter` 的 `$params`。

支持的 `prop`：

| prop | 说明 | 额外字段 |
|---|---|---|
| `input` | 单行输入框 | `type`（text/email/number…） |
| `textarea` | 多行文本 | — |
| `switch` | 开关 | — |
| `select` | 下拉选择 | `options`：`{值: 展示文案}` 映射 |

### 3.4 addAfter（可选）

购买成功（扣款、减库存完成）后执行业务逻辑：

```php
class MyAfter extends After
{
    // 返回 false 或抛异常视为失败：store 会自动退款并回补库存
    public static function after(User $user, StoreModel $store, $params)
    {
        // 例如：发放邀请码、开通用户组……
        return true;
    }
}
```

> 失败时**无需**手动处理退款/库存，store 自动回滚；也无需监听 `StoreBuyFailEvent`。

### 3.5 addInvalid（可选）

限时商品过期、或自动扣费失败时执行：

```php
class MyInvalid extends Invalid
{
    // 例如：收回用户组、标记权益失效……
    public static function invalid(StoreModel $store, StoreCartModel $cart)
    {
        return true;
    }
}
```

### 3.6 addEnable（可选，永久道具）

商品 `use_type = permanent`（永久道具）时，背包中显示「使用/取消使用」按钮，点击时调用：

```php
class MyEnable extends Enable
{
    // $enabled 为 true=使用 false=取消使用
    public static function enable(User $user, StoreModel $store, StoreCartModel $cart)
    {
        // 例如：给用户加/移出用户组
        return true;
    }
}
```

### 3.7 addUse（可选，一次性道具）

商品 `use_type = consumable`（一次性道具）时，背包中显示「使用」按钮，每次使用消耗一件（最旧一条购买记录置为已使用）。回调类只需提供静态方法 `use(User $actor, StoreModel $store, StoreCartModel $cart): bool`（无基类约束）：

```php
class MyUse
{
    // 返回 false 视为使用失败，购买记录不会被消耗
    public static function use(User $actor, StoreModel $store, StoreCartModel $cart)
    {
        return true;
    }
}
```

---

## 4. 一个插件注册多个商品

**现有逻辑已支持。** 每个 `StoreExtend` 实例对应一个商品，key 即商品 code。同一插件的 `extend.php` 中实例化多次即可：

```php
return [
    // 商品 1：VIP 月卡
    (new StoreExtend('my-vip-month'))
        ->addStoreGoods(VipMonthGoods::class)
        ->addAfter(VipMonthAfter::class)
        ->addInvalid(VipInvalid::class),

    // 商品 2：VIP 年卡（同一插件的第二个商品）
    (new StoreExtend('my-vip-year'))
        ->addStoreGoods(VipYearGoods::class)
        ->addAfter(VipYearAfter::class)
        ->addInvalid(VipInvalid::class),
];
```

行为说明：

- 三个商品的 `code` 分别是 `my-vip-month` / `my-vip-year`，在管理端添加商品时是**三个独立的插件卡片**，各自独立配置价格、库存、有效期、分组、subtype 等。
- 每个 key 的 Validate / After / Invalid / Enable / Use 完全独立，互不干扰。
- 可以只给部分商品注册某个钩子（例如年卡有折扣校验、月卡没有）。
- **key 全局唯一**：不同扩展之间、同一扩展的不同商品之间都不能重复，建议带上扩展名前缀（如 `myext-goods-a`）。
- 禁用扩展时，该扩展注册的所有商品 key 都会被自动下架。

---

## 5. 前端组件注册（可选）

不注册时 store 提供默认组件；注册后可用自定义组件整体替换。

### 5.1 用户端 `app.storeRegistry`

在商品插件的 `js/src/forum/index.ts` initializer 中：

```ts
import MyGoodsCard from './components/MyGoodsCard';
import MyBackpackCard from './components/MyBackpackCard';

export const key = 'my-goods';

app.initializers.add('my-goods', () => {
  app.storeRegistry.item.register('my-goods', MyGoodsCard);            // 商店页商品卡片（整体替换）
  app.storeRegistry.detail.register('my-goods', MyGoodsDetail);        // 商品详情（点击卡片进入）
  app.storeRegistry.priceModal.register('my-goods', MyPriceModal);     // 购买/价格弹窗（整体替换 StoreBox）
  app.storeRegistry.backpackItem.register('my-goods', MyBackpackCard); // 背包条目（props: item / onChanged）
  app.storeRegistry.backpackPanel.register('my-goods', MyPanel);       // 背包条目内的状态面板（props: item）
  app.storeRegistry.backpackDetail.register('my-goods', MyDetail);     // 背包商品详情弹窗（props: item）
  app.storeRegistry.backpackUseModal.register('my-goods', MyUseModal); // 使用结果弹窗（props: item / result）
});
```

### 5.2 管理端 `app.storeAdminRegistry`

```ts
app.initializers.add('my-goods-admin', () => {
  app.storeAdminRegistry.priceModal.register('my-goods', MyAdminPriceModal); // 商品价格弹窗
  app.storeAdminRegistry.goodsForm.register('my-goods', MyFormFields);       // 添加/编辑商品表单扩展区（props: params / storeData）
  app.storeAdminRegistry.listItem.register('my-goods', MyListItem);          // 商品列表行展示（props: item）
});
```

---

## 6. 权限与隐藏

- **商店访问权限**：后台「权限」页配置 `mattoid-store.group-view`（允许用户组访问商店）。无权限用户的购买按钮置灰显示「无购买权限」。
- **商品级隐藏**：商品勾选「限时无权限隐藏」后，前端按 `can{Code首字母大写}View` 用户属性决定是否展示该商品。商品插件如需支持此能力，需自行通过 Flarum 的 User extender 输出该属性，例如 code 为 `my-goods` 时输出属性 `canMyGoodsView`：

```php
(new Extend\User())->attributes(function ($serializer, $user) {
    return ['canMyGoodsView' => $user->can('my-goods.group-view')];
}),
```

---

## 7. 事件机制

事件不受事务管理，仅在流程结束前后通知。推荐优先使用 `StoreExtend` 注册钩子（自动回滚）；需要跨插件联动时再使用事件：

| 事件 | 方向 | 说明 |
|---|---|---|
| `StoreBuyEvent` | store → 插件监听 | 购买完成通知 |
| `StoreBuyFailEvent` | 插件通知 → store 监听 | 触发自动退款 + 回补库存（用 StoreExtend 注册则无需关心） |
| `StoreInvalidEvent` | store → 插件监听 | 商品失效通知（无论扣费是否成功） |
| `StoreCartAddEvent` | 插件通知 → store 监听 | 添加购物车（自动减库存） |
| `StoreCartEditEvent` | 插件通知 → store 监听 | 编辑购物车（status>1 自动回补库存） |
| `StoreStockAddEvent` | 插件通知 → store 监听 | 回滚库存 |
| `StoreStockSubEvent` | 插件通知 → store 监听 | 扣除库存 |

---

## 8. 开发注意事项 checklist

1. **key（code）全局唯一**，建议 `扩展名-商品名` 格式。
2. 商品信息类中 `$name`、`$popUp`、`$className` 必须以 **public** 重新声明。
3. 所有展示文案（name、popUp label/helpText、itemTypes name、group）都走**翻译键**，记得在 locale 里配置中英双语。
4. `After::after()` 返回 false 或抛异常会自动退款回补库存，不要重复处理。
5. `Use::use()` 返回 false 时购买记录**不会**被消耗，可安全校验后再返回 true。
6. 一次性（consumable）与永久（permanent）道具由管理员在后台配置 use_type，插件的 `addUse` / `addEnable` 应与商品类型匹配；注册后管理端才会显示对应按钮。
7. 商品要出现在用户背包中，必须在 Goods 类声明 `public $usable = true;`（基类默认 false 不进背包）。
8. 不要读写 `store_goods` 表（已废弃）；不要依赖插件启用时往数据库写数据。
9. 前端注册组件时 key 必须与后端注册 key 一致。
10. 时区统一使用后台配置的 `mattoid-store.storeTimezone`（默认 Asia/Shanghai），处理有效期计算时注意。
11. 插件禁用后对应商品自动下架；重新启用后需在管理端手动重新上架。

---

## 9. 参考实现

- 邀请码（含 popUp 动态表单、Validate/After/Invalid 完整链路）：`mattoid/flarum-ext-store-invite`
- 本扩展源码：`packages/flarum-ext/flarum-ext-store`
