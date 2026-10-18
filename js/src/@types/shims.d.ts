import 'flarum/common/models/User';
import 'flarum/forum/ForumApplication';
import 'flarum/admin/AdminApplication';

/**
 * 扩展 User 模型属性
 */
declare module 'flarum/common/models/User' {
  export default interface User {
    money?: () => number;
  }
}

/**
 * 扩展前台应用全局属性
 */
declare module 'flarum/forum/ForumApplication' {
  export default interface ForumApplication {
    storeRegistry?: any;
  }
}

/**
 * 扩展后台应用全局属性
 */
declare module 'flarum/admin/AdminApplication' {
  export default interface AdminApplication {
    storeAdminRegistry?: any;
  }
}

declare global {
  // 商店商品属性数据
  interface StoreItemData {
    id: number | string;
    code: string;
    title: string;
    desc?: string;
    icon?: string;
    pluginIcon?: string;
    pluginExtIcon?: {
      name?: string;
      backgroundColor?: string;
      color?: string;
      backgroundImage?: string;
    };
    price: number;
    stock: number;
    discount: number;
    discountLimit: number;
    discountLimitUnit: 'days' | 'hour' | 'minute' | 'second' | string;
    discountPrice: number;
    type: 'permanent' | 'limit' | string;
    outtime?: number | string;
    hide?: number | boolean;
    repeat?: number | boolean;
    status: 0 | 1 | 2 | 9 | number;
    autoDeduction?: number | boolean;
    useType?: 'permanent' | 'consumable' | string;
    subtype?: string;
    group?: string;
    purchaseLimitEnable?: number | boolean;
    purchaseLimitCount?: number;
    purchaseLimitPeriod?: number;
    purchaseLimitPeriodUnit?: string;
    usable?: number | boolean;
    popUp?: string;
    className?: string;
    orphaned?: boolean;
    payAmt?: number;
    enable?: number | boolean;
    enableType?: number;
    source?: string;
    itemCount?: number;
    itemStatus?: number | boolean;
    itemPropertyImage?: string;
    refId?: number | string;
    remaining?: number;
    createdAt?: string;
    updatedAt?: string;
  }

  // JSON:API 格式资源对象
  interface StoreApiResource {
    id: string;
    type: string;
    attributes: StoreItemData;
  }

  // 商品插件基类元数据
  interface GoodsTypeData {
    code: string;
    name: string;
    group?: string;
    desc?: string;
    price?: number;
    stock?: number;
    discount?: number;
    discountLimit?: number;
    discountLimitUnit?: string;
    type?: string;
    outtime?: number;
    icon?: string;
    extIcon?: {
      name?: string;
      backgroundColor?: string;
      color?: string;
      backgroundImage?: string;
    };
    itemTypes?: Array<{ name?: string; key?: string }>;
    hide?: number;
    repeat?: number;
    autoDeduction?: number;
    usable?: number;
    useType?: string;
    subtype?: string;
    purchaseLimitEnable?: number;
    purchaseLimitCount?: number;
    purchaseLimitPeriod?: number;
    purchaseLimitPeriodUnit?: string;
  }

  // 商品类型资源对象
  interface GoodsTypeResource {
    id: string;
    type: string;
    attributes: GoodsTypeData;
  }

  // 购买弹窗动态表单字段（与后端 src/Goods/Goods.php 中 $popUp 对齐）
  interface StoreBoxField {
    prop: 'input' | 'switch' | 'select' | 'textarea';
    label?: string;
    helpText?: string;
    value: string;
    type?: string;
    options?: Record<string, string>;
  }
}
