/**
 * 移动端判定（与装饰店插件同款口径）：
 * - 移动版切换标记（mobileLoad）；
 * - 常见手机 UA；
 * - 小屏断点（与 less 中 576px 响应式断点一致）
 */
export default function isMobile(): boolean {
  if (localStorage.getItem('mobileLoad') === 'mobile') {
    return true;
  }
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
  return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 576px)').matches;
}
