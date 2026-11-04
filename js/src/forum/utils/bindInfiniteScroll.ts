import isMobile from './isMobile';
import type PaginatedList from '../PaginatedList';

/** 距页面底部多少像素即触发加载 */
const BOTTOM_THRESHOLD = 300;

/**
 * 瀑布流自动加载（仅移动端）：
 * 滚动接近页面底部且有下一页、无请求进行中时自动 loadMore；
 * 返回解绑函数，组件 onremove 时调用。
 */
export default function bindInfiniteScroll(list: PaginatedList): () => void {
  if (!isMobile()) {
    return () => {};
  }

  let ticking = false;

  // 页面总高：body 与 documentElement 取大者（部分布局下 body 高度不包含全部内容，
  // 只读 body.scrollHeight 会导致「滚到底也不触发」）
  const pageHeight = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

  const check = () => {
    if (list.loading || !list.hasMore()) {
      return;
    }
    const scrollBottom = window.innerHeight + (window.scrollY || window.pageYOffset);
    if (scrollBottom >= pageHeight() - BOTTOM_THRESHOLD) {
      list.loadMore();
    }
  };

  const handler = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      check();
    });
  };

  window.addEventListener('scroll', handler, { passive: true });
  // 首屏内容不足一屏时不会触发 scroll，主动检查一次（延迟到首屏渲染完成后）
  setTimeout(check, 300);

  return () => window.removeEventListener('scroll', handler);
}
