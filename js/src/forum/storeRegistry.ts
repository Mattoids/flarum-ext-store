import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';

/**
 * 商品插件组件注册表
 * Goods plugin component registry
 *
 * 商品插件（JS 端）在各自 initializer 中注册自定义组件：
 *   app.storeRegistry.item.register('vip', MyGoodsCard);           // 商店页商品卡片（整体替换）
 *   app.storeRegistry.detail.register('vip', MyGoodsDetail);       // 商品详情（点击卡片进入）
 *   app.storeRegistry.priceModal.register('vip', MyPriceModal);    // 购买/价格弹窗（整体替换 StoreBox）
 *   app.storeRegistry.backpackItem.register('vip', MyBackpackCard);// 背包条目（整体替换，props: item / onChanged）
 *   app.storeRegistry.backpackPanel.register('vip', MyPanel);      // 背包条目内的状态面板（props: item）
 *   app.storeRegistry.backpackDetail.register('vip', MyDetail);    // 背包商品详情弹窗（点击标题，props: item）
 *   app.storeRegistry.backpackUseModal.register('vip', MyUseModal);// 使用/取消使用后的结果弹窗（props: item / result）
 *
 * 管理端对应注册表见 app.storeAdminRegistry（js/src/admin/storeAdminRegistry.ts）。
 * 未注册时使用 store 扩展提供的默认组件。
 */
export class StoreRegistry {
  private map: Map<string, typeof Component> = new Map();

  register(code: string, component: typeof Component): void {
    this.map.set(code, component);
  }

  get(code: string): typeof Component | null {
    return this.map.get(code) || null;
  }

  has(code: string): boolean {
    return this.map.has(code);
  }
}

export interface StoreRegistries {
  item: StoreRegistry;
  detail: StoreRegistry;
  backpackItem: StoreRegistry;
  backpackPanel: StoreRegistry;
  backpackDetail: StoreRegistry;
  backpackUseModal: StoreRegistry;
  priceModal: StoreRegistry;
}

export default function initStoreRegistry(): StoreRegistries {
  const registries: StoreRegistries = {
    item: new StoreRegistry(),
    detail: new StoreRegistry(),
    backpackItem: new StoreRegistry(),
    backpackPanel: new StoreRegistry(),
    backpackDetail: new StoreRegistry(),
    backpackUseModal: new StoreRegistry(),
    priceModal: new StoreRegistry(),
  };

  (app as any).storeRegistry = registries;

  return registries;
}
