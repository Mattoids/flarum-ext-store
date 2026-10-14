import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';

/**
 * 管理端商品插件组件注册表
 * Admin goods plugin component registry
 *
 * 商品插件（JS 端）在各自 admin initializer 中注册：
 *   app.storeAdminRegistry.priceModal.register('vip', MyPriceModal);  // 商品价格弹窗
 *   app.storeAdminRegistry.goodsForm.register('vip', MyFormFields);   // 添加/编辑商品表单扩展区
 *   app.storeAdminRegistry.listItem.register('vip', MyListItem);      // 商品列表行展示
 *
 * 未注册时使用 store 扩展提供的默认组件。
 */
export class StoreAdminRegistry {
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

export interface StoreAdminRegistries {
  priceModal: StoreAdminRegistry;
  goodsForm: StoreAdminRegistry;
  listItem: StoreAdminRegistry;
}

export default function initStoreAdminRegistry(): StoreAdminRegistries {
  const registries: StoreAdminRegistries = {
    priceModal: new StoreAdminRegistry(),
    goodsForm: new StoreAdminRegistry(),
    listItem: new StoreAdminRegistry(),
  };

  (app as any).storeAdminRegistry = registries;

  return registries;
}
