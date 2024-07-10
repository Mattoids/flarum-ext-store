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
     * 弹窗样式
     * Pop up Style
     *
     * @var string
     */
    protected $className = 'store-buy Modal--small';
}
