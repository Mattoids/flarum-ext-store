# Product Plugin Development Guide (flarum-ext-store)

> Applies to: flarum-ext-store versions after the `fix/security-stability-20261010` branch.
> This guide is for **product plugin** developers: how to build a product plugin on top of the store extension.

---

## 1. Architecture Changes (Upgraded Core)

Legacy: when a product plugin was enabled, it wrote product info into the `store_goods` database table, and the store relied on those rows to detect products.

New: **the runtime registry is the single source of truth**. Product plugins register via `Mattoid\Store\Extend\StoreExtend` in `extend.php`; registration data lives in an in-memory static registry:

- The `store_goods` table is no longer read or written (it is deprecated, kept only for compatibility — do not use it).
- When a plugin is **disabled**, the store automatically takes all its products (matched by registration key) off the shelf (`status=0`).
- The admin "Add Product" modal reads the plugin list directly from the registry — no database initialization is required.

---

## 2. Minimal Working Example

### 2.1 Directory Structure

```
flarum-ext-my-goods/
├── composer.json
├── extend.php
├── locale/
│   └── en.yml
└── src/
    └── Goods/
        ├── MyGoods.php       // Product info (required)
        ├── MyValidate.php    // Pre-purchase validation (optional)
        ├── MyAfter.php       // Post-purchase business logic (optional)
        ├── MyInvalid.php     // Invalidation/expiry handling (optional)
        └── MyUse.php         // Consumable item usage logic (optional)
```

### 2.2 Registering in extend.php

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

    // 'my-goods' is the unique KEY of the product (= product code), globally unique
    (new StoreExtend('my-goods'))
        ->addStoreGoods(MyGoods::class)   // Product info (required; all others optional)
        ->addValidate(MyValidate::class)  // Pre-purchase validation
        ->addAfter(MyAfter::class)        // Business logic after a successful purchase
        ->addInvalid(MyInvalid::class),   // Logic when the product becomes invalid / deduction fails
];
```

### 2.3 Product Info Class

```php
<?php

namespace Mattoid\StoreMyGoods\Goods;

use Mattoid\Store\Goods\Goods;

class MyGoods extends Goods
{
    // Product name: a translation key, resolved by the translator at display time
    public $name = 'my-goods.forum.title';

    // Dynamic form descriptors for the purchase popup (optional, see 3.3)
    public $popUp = [
        [
            'label'    => 'my-goods.forum.email',      // Translation key: field label
            'prop'     => 'input',                      // Element type: input/switch/textarea/select
            'type'     => 'email',                      // The input element's type attribute
            'value'    => 'email',                      // Parameter key submitted with the purchase
            'helpText' => 'my-goods.forum.email-help',  // Translation key: help text below the field
        ],
    ];

    // Item type declaration (optional): used by the store filter bar's "Item Type" dimension and the admin subtype dropdown
    public $itemTypes = [
        ['key' => 'month', 'name' => 'my-goods.admin.item-type-month'],
        ['key' => 'year',  'name' => 'my-goods.admin.item-type-year'],
    ];

    // Group declaration (optional): used by the store filter bar's "Group" dimension; empty = default group.
    // Value is a translation key; a product (store row) can override the group in the admin panel,
    // otherwise it inherits this declaration.
    public $group = 'my-goods.group-vip';

    // Plugin logo image URL (optional): fallback shown on admin product cards/lists when no icon is set,
    // e.g. '/assets/extensions/my-goods/logo.svg'. Falls back to the icon declared in composer.json when empty.
    public $icon = '';

    // The following are form default declarations (all optional; null = no preset, use the admin form defaults):
    // Validity in days (maps to the form's "Validity")
    public $outtime = null;
    // Whether purchase limit is enabled, 0/1 (maps to the form's "Enable purchase limit" switch)
    public $purchaseLimitEnable = null;
    // Purchase limit count per period (maps to the form's "Limit per period")
    public $purchaseLimitCount = null;
    // Purchase limit period value, 0 = lifetime limit (maps to the form's "Limit period")
    public $purchaseLimitPeriod = null;
    // Purchase limit period unit: days/hour/minute/second (maps to the form's "Period unit")
    public $purchaseLimitPeriodUnit = null;

    // Purchase popup style class name (optional)
    public $className = 'store-buy Modal--small';
}
```

> **Note**: `$name`, `$popUp` and `$className` are `protected` in the base class. Subclasses **must re-declare them as `public`** (as above), otherwise the registry cannot read them.

---

## 3. Registration Capabilities in Detail

### 3.1 addStoreGoods (required)

Registers the product info class. The admin "Add Product" modal uses it to render plugin cards (name, logo, itemTypes tags).

### 3.2 addValidate (optional)

Pre-purchase validation. Throw an exception to block the purchase:

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
                'email' => 'Email must not be empty',
            ]);
        }
        return true;
    }
}
```

### 3.3 Purchase Popup Dynamic Form (popUp)

`Goods::$popUp` is an array of descriptors. The store purchase popup (StoreBox) renders the form dynamically from it; on submit, values are sent with the purchase request under the `value` keys, and arrive as `$params` in `addValidate` / `addAfter`.

Supported `prop` values:

| prop | Description | Extra fields |
|---|---|---|
| `input` | Single-line input | `type` (text/email/number…) |
| `textarea` | Multi-line text | — |
| `switch` | Switch/toggle | — |
| `select` | Dropdown | `options`: `{value: display text}` map |

### 3.4 addAfter (optional)

Runs after a successful purchase (payment and stock deduction complete):

```php
class MyAfter extends After
{
    // Returning false or throwing is treated as failure: the store refunds and restores stock automatically
    public static function after(User $user, StoreModel $store, $params)
    {
        // e.g. issue an invite code, assign a user group……
        return true;
    }
}
```

> On failure you do **not** need to handle refunds/stock manually — the store rolls back automatically. There is also no need to listen for `StoreBuyFailEvent`.

### 3.5 addInvalid (optional)

Runs when a limited-time product expires or an automatic deduction fails:

```php
class MyInvalid extends Invalid
{
    // e.g. revoke a user group, mark a benefit as expired……
    public static function invalid(StoreModel $store, StoreCartModel $cart)
    {
        return true;
    }
}
```

### 3.6 addEnable (optional, permanent items)

When a product's `use_type = permanent`, the backpack shows "Use / Stop using" buttons; clicking them invokes:

```php
class MyEnable extends Enable
{
    // $enabled: true = use, false = stop using
    public static function enable(User $user, StoreModel $store, StoreCartModel $cart)
    {
        // e.g. add/remove the user from a group
        return true;
    }
}
```

### 3.7 addUse (optional, consumable items)

When a product's `use_type = consumable`, the backpack shows a "Use" button; each use consumes one item (the oldest purchase record is marked used). The callback class only needs a static method `use(User $actor, StoreModel $store, StoreCartModel $cart): bool` (no base class constraint):

```php
class MyUse
{
    // Returning false means the usage failed and the purchase record is NOT consumed
    public static function use(User $actor, StoreModel $store, StoreCartModel $cart)
    {
        return true;
    }
}
```

---

## 4. Registering Multiple Products in One Plugin

**Already supported.** Each `StoreExtend` instance corresponds to one product; the key is the product code. Just instantiate it multiple times in the plugin's `extend.php`:

```php
return [
    // Product 1: VIP monthly card
    (new StoreExtend('my-vip-month'))
        ->addStoreGoods(VipMonthGoods::class)
        ->addAfter(VipMonthAfter::class)
        ->addInvalid(VipInvalid::class),

    // Product 2: VIP yearly card (a second product of the same plugin)
    (new StoreExtend('my-vip-year'))
        ->addStoreGoods(VipYearGoods::class)
        ->addAfter(VipYearAfter::class)
        ->addInvalid(VipInvalid::class),
];
```

Behavior notes:

- The three products have `code` values `my-vip-month` / `my-vip-year`; they appear as **three independent plugin cards** in the admin "Add Product" modal, each configured separately (price, stock, validity, group, subtype, etc.).
- Validate / After / Invalid / Enable / Use are fully independent per key.
- You may register a hook for only some products (e.g. the yearly card has a discount validation, the monthly card does not).
- **Keys are globally unique**: no duplicates across extensions or across products of the same extension. Prefix with your extension name (e.g. `myext-goods-a`).
- Disabling an extension takes all product keys it registered off the shelf automatically.

---

## 5. Frontend Component Registration (Optional)

The store provides default components when nothing is registered; registering replaces them entirely.

### 5.1 Forum-side `app.storeRegistry`

In the product plugin's `js/src/forum/index.ts` initializer:

```ts
import MyGoodsCard from './components/MyGoodsCard';
import MyBackpackCard from './components/MyBackpackCard';

export const key = 'my-goods';

app.initializers.add('my-goods', () => {
  app.storeRegistry.item.register('my-goods', MyGoodsCard);            // Store page product card (full replacement)
  app.storeRegistry.detail.register('my-goods', MyGoodsDetail);        // Product detail (opened by clicking a card)
  app.storeRegistry.priceModal.register('my-goods', MyPriceModal);     // Purchase/price modal (full replacement of StoreBox)
  app.storeRegistry.backpackItem.register('my-goods', MyBackpackCard); // Backpack entry (props: item / onChanged)
  app.storeRegistry.backpackPanel.register('my-goods', MyPanel);       // Status panel inside a backpack entry (props: item)
  app.storeRegistry.backpackDetail.register('my-goods', MyDetail);     // Backpack product detail modal (props: item)
  app.storeRegistry.backpackUseModal.register('my-goods', MyUseModal); // Usage result modal (props: item / result)
});
```

### 5.2 Admin-side `app.storeAdminRegistry`

```ts
app.initializers.add('my-goods-admin', () => {
  app.storeAdminRegistry.priceModal.register('my-goods', MyAdminPriceModal); // Product price modal
  app.storeAdminRegistry.goodsForm.register('my-goods', MyFormFields);       // Add/edit product form extension area (props: params / storeData)
  app.storeAdminRegistry.listItem.register('my-goods', MyListItem);          // Product list row display (props: item)
});
```

---

## 6. Permissions and Hiding

- **Store access permission**: configure `mattoid-store.group-view` on the admin "Permissions" page (allow user groups to access the store). Users without permission see the purchase button greyed out with "No purchase permission".
- **Per-product hiding**: when a product has "Hide when no permission during validity" checked, the forum side decides visibility via the `can{Code-ucfirst}View` user attribute. To support this, the product plugin must output the attribute via Flarum's User extender; e.g. for code `my-goods`, output `canMyGoodsView`:

```php
(new Extend\User())->attributes(function ($serializer, $user) {
    return ['canMyGoodsView' => $user->can('my-goods.group-view')];
}),
```

---

## 7. Event Mechanism

Events are not transaction-managed; they only notify before/after a flow ends. Prefer registering hooks via `StoreExtend` (automatic rollback); use events only for cross-plugin coordination:

| Event | Direction | Description |
|---|---|---|
| `StoreBuyEvent` | store → plugin listens | Purchase completed notification |
| `StoreBuyFailEvent` | plugin dispatches → store listens | Triggers automatic refund + stock restore (no need to care when using StoreExtend) |
| `StoreInvalidEvent` | store → plugin listens | Product invalidation notification (regardless of deduction success) |
| `StoreCartAddEvent` | plugin dispatches → store listens | Add to cart (stock deducted automatically) |
| `StoreCartEditEvent` | plugin dispatches → store listens | Edit cart (stock restored automatically if `status > 1`) |
| `StoreStockAddEvent` | plugin dispatches → store listens | Restore stock |
| `StoreStockSubEvent` | plugin dispatches → store listens | Deduct stock |

---

## 8. Development Checklist

1. The key (code) is **globally unique**; use the `extension-product` naming format.
2. `$name`, `$popUp` and `$className` in the product info class must be re-declared as **public**.
3. All display text (name, popUp label/helpText, itemTypes name, group) uses **translation keys** — remember to provide both Chinese and English in locale files.
4. `After::after()` returning false or throwing triggers an automatic refund and stock restore — do not handle it twice.
5. When `Use::use()` returns false, the purchase record is **not** consumed — you can validate safely and return true afterwards.
6. Consumable vs. permanent items are configured by the administrator via `use_type`; the plugin's `addUse` / `addEnable` must match the product type, otherwise the corresponding buttons won't show in the admin panel.
7. Do not read or write the `store_goods` table (deprecated); do not rely on writing data to the database when the plugin is enabled.
8. Frontend component registration keys must match the backend registration keys.
9. Timezone handling uses the admin-configured `mattoid-store.storeTimezone` (default Asia/Shanghai); pay attention when computing validity periods.
10. Products are taken off the shelf automatically when the plugin is disabled; after re-enabling, they must be manually put back on the shelf in the admin panel.

---

## 9. Reference Implementations

- Invite codes (full chain with popUp dynamic form and Validate/After/Invalid): `mattoid/flarum-ext-store-invite`
- This extension's source code: `packages/flarum-ext/flarum-ext-store`

---

## 中文版

中文文档见 [goods-plugin-dev_cn.md](goods-plugin-dev_cn.md)。
