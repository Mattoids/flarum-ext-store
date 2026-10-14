<?php

namespace Mattoid\Store\Backpack;

/**
 * 装饰店（ziiven/flarum-decoration-store）背包条目桥接提供者
 *
 * 将原 BackpackListController 中对 Ziven\decorationStore 模型的直接依赖收敛到此类，
 * 装饰店未安装或升级导致结构变化时，只影响这一个文件。
 *
 * TODO: 长期应迁移为 decoration-store 自行通过 StoreExtend::addBackpackProvider 注册。
 */
class DecorationStoreBridge
{
    public function __invoke(int $userId): array
    {
        $purchaseClass = 'Ziven\\decorationStore\\Model\\DecorationStorePurchase';
        $storeClass = 'Ziven\\decorationStore\\Model\\DecorationStore';
        if (!class_exists($purchaseClass) || !class_exists($storeClass)) {
            return [];
        }

        $purchases = $purchaseClass::query()
            ->where('user_id', $userId)
            ->where('is_expired', 0)
            ->orderByDesc('id')
            ->get();

        if ($purchases->isEmpty()) {
            return [];
        }

        $decoItems = $storeClass::query()
            ->whereIn('id', $purchases->pluck('item_id')->all())
            ->get()
            ->keyBy('id');

        $items = [];
        foreach ($purchases as $purchase) {
            $deco = $decoItems->get($purchase->item_id);
            $property = $deco ? json_decode($deco->item_property) : null;
            $image = $property && !empty($property->image) ? $property->image : '';

            $item = new \stdClass();
            $item->id = 'decoration-' . $purchase->id;
            $item->source = 'decoration';
            $item->refId = $purchase->id;
            $item->title = $deco ? $deco->item_title : '';
            $item->icon = $image;
            $item->itemType = $purchase->item_type;
            $item->itemStatus = (int) $purchase->item_status;
            $item->itemCount = (int) $purchase->item_count;
            $item->expiredDays = (int) $purchase->expired_days;
            $item->itemPropertyImage = $image;
            $item->createdAt = $purchase->assigned_at;
            $items[] = $item;
        }

        return $items;
    }
}
