import Model from 'flarum/common/Model';

/**
 * 商店通知主体（notification-store-types）
 *
 * 通知序列化时 subject 会以该 type 出现在 included 中，
 * 必须在前端 Store 注册对应模型，否则通知列表渲染不出内容
 * （与 invite 插件的 notification-invite-types 同理）。
 */
export default class StoreNotificationSubject extends Model {}
