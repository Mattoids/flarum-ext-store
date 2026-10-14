<?php

namespace Mattoid\Store\Goods;

/**
 * 商品信息类，用于定义商品名称、购买弹窗等信息
 *
 * Product information class, used to define product names, purchase pop ups, and other information
 */
abstract class Goods
{
    /**
     * 商品名称
     * Goods Name
     *
     * @var String
     */
    protected $name;

    /**
     * 弹窗内容
     * Pop up content
     *
     * @var Array
     *
     * @example
     * [
     *   [
     *   'label' => 'mattoid-store-invite.forum.email',
     *   'prop' => 'input',
     *   'type' => 'email',
     *   'value' => 'email',
     *   'helpText' => 'mattoid-store-invite.forum.email-help'
     *   ]
     * ]
     *
     * [
     *   [
     *   // @label 当前行的说明、标题等
     *   // @label The description, title, etc. of the current line
     *   'label' => 'mattoid-store-invite.forum.email',
     *
     *   // @prop 元素类型。目前支持（input / switch / textarea / select）
     *   // @prop Element type. Currently supported（input / switch / textarea / select）
     *   'prop' => 'input',
     *
     *   // @type 元素的 type 属性，通常用于 input 中
     *   // @type The type attribute of an element, usually used in input
     *   'type' => 'email',
     *
     *   // @value 元素值传输的key，用于插件自己接收属性信息
     *   // @value 元素值传输的key，用于插件自己接收属性信息
     *   'value' => 'email',
     *
     *   // @helpText 当前行的补充说明
     *   // @helpText Additional explanation for the current line
     *   'helpText' => 'mattoid-store-invite.forum.email-help'
     *   ]
     * ]
     */
    protected $popUp = [];

    /**
     * 道具类型声明（可选），用于商店筛选第 2 级与管理端 subtype 下拉。
     * Item type declaration (optional), used for store filter level 2 and admin subtype dropdown.
     *
     * @var Array
     *
     * @example
     * [
     *   ['key' => 'month', 'name' => 'mattoid-store-vip.admin.item-type-month'],
     *   ['key' => 'year',  'name' => 'mattoid-store-vip.admin.item-type-year'],
     * ]
     *
     * key 为写入 store.subtype 的值；name 为翻译键，展示时经 translator 转换。
     */
    public $itemTypes = [];

    /**
     * 分组声明（可选），用于商店筛选第 1 级。
     * Group declaration (optional), used for store filter level 1.
     *
     * 值为翻译键（如 'mattoid-store-invite.group-invite'）；留空 = 默认分组。
     * 商品（store 行）可在后台覆盖分组，未覆盖时继承此处声明。
     *
     * @var string
     */
    public $group = '';

    /**
     * 插件 Logo 图标地址（可选），用于管理端添加商品卡片等位置展示。
     * Plugin logo icon URL (optional), displayed in admin add-goods cards, etc.
     *
     * 通常为插件 assets 目录下的图片路径，如 '/assets/extensions/mattoid-store-invite/logo.png'。
     *
     * @var string
     */
    public $icon = '';

    /**
     * 弹窗样式
     * Pop up Style
     *
     * @var string
     */
    protected $className = 'store-buy Modal--small';
}
