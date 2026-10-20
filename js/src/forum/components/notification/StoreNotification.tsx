import app from 'flarum/forum/app';
import Notification from 'flarum/forum/components/Notification';

export default class StoreNotification extends Notification {
  /**
   * 图标
   */
  icon() {
    return this.attrs.notification?.content()?.icon;
  }

  /**
   * 跳转链接
   */
  href() {
    return this.attrs.notification?.content()?.url;
  }

  /**
   * 摘要（小字）
   */
  excerpt() {
    return this.attrs.notification?.content()?.excerpt;
  }

  /**
   * 通知内容/标题
   */
  content() {
    const message = this.attrs.notification?.content()?.message;
    return m('div', message);
  }
}
