import Extend from 'flarum/common/extenders';
import StoreNotificationSubject from './models/StoreNotificationSubject';

/**
 * 商店通知主体模型注册（notification-store-types）
 *
 * 通知序列化时 subject 会以该 type 出现在 included 中，
 * 必须在前端 Store 注册对应模型，否则通知列表渲染不出内容
 * （与 invite 插件的 notification-invite-types 同理）。
 */
export default [new Extend.Store().add('notification-store-types', StoreNotificationSubject)];
