import isMobile from './isMobile';
import type PaginatedList from '../PaginatedList';

/** 距页面底部多少像素即触发加载 */
const BOTTOM_THRESHOLD = 300;

/**
 * 瀑布流自动加载（仅移动端）：
 * 滚动接近页面底部且有下一页、无请求进行中时自动 loadMore；
 * 返回解绑函数，组件 onremove 时调用。
 */
export default function bindInfiniteScroll(list: PaginatedList<any>): () => void {
  if (!isMobile()) {
    return () => {};
  }

  let ticking = false;

  const handler = () => {
    if (ticking) {
      return;
    }
    ticking = true;

    requestAnimationFrame(() => {
      ticking = false;
      if (list.loading || !list.hasMore()) {
        return;
      }
      const scrollBottom = window.innerHeight + (window.scrollY || window.pageYOffset);
      if (scrollBottom >= document.body.scrollHeight - BOTTOM_THRESHOLD) {
        list.loadMore();
      }
    });
  };

  window.addEventListener('scroll', handler, { passive: true });
  // 首屏内容不足一屏时不会触发 scroll，主动检查一次
  handler();

  return () => window.removeEventListener('scroll', handler);
}
