/**
 * 全局类型增强（Solution A + TS 类型化）
 * Global type augmentations.
 */

// API 资源数据
// API resource data shape
interface StoreItemData {
  id: number | string;
  code: string;
  title: string;
  desc?: string;
  icon?: string;
  price: number;
  stock: number;
  discount: number;
  discountLimit: number;
  discountLimitUnit: 'days' | 'hour' | 'minute' | 'second' | string;
  discountPrice: number;
  type: 'permanent' | 'limit';
  outtime?: number | string;
  hide?: number | boolean;
  repeat?: number | boolean;
  status: 0 | 1 | 2 | 9;
  autoDeduction?: number | boolean;
  popUp?: string;
  className?: string;
  orphaned?: boolean;
  payAmt?: number;
  enable?: number | boolean;
  enableType?: number;
  createdAt?: string;
  updatedAt?: string;
}

// JSON:API 风格的 resource
// JSON:API resource shape
interface StoreApiResource {
  id: string;
  type: string;
  attributes: StoreItemData;
}

// 商品基类元数据
// Product type metadata
interface GoodsTypeData {
  code: string;
  name: string;
}

interface GoodsTypeResource {
  id: string;
  type: string;
  attributes: GoodsTypeData;
}

// 弹窗动态表单字段（与 src/Goods/Goods.php 中 $popUp 对齐）
// Dynamic form field for buy modal (matches src/Goods/Goods.php $popUp shape)
interface StoreBoxField {
  prop: 'input' | 'switch' | 'select' | 'textarea';
  label: string;
  helpText?: string;
  value: string;
  type?: string;
  options?: Record<string, string>;
}
