import app from 'flarum/forum/app';

export interface IPaginatedListOptions {
  /** 请求路径，如 /store/list */
  endpoint: string;
  /** 构造额外请求参数（filter 等），每次请求时调用 */
  params?: () => Record<string, any>;
  /** 首页（offset=0）加载失败时清空已展示条目（默认保留旧列表） */
  clearItemsOnRefreshError?: boolean;
}

/**
 * 分页列表状态与加载逻辑（组合式，Page/Modal 共用）：
 * 维护条目数组、loading、hasMore，内置请求序号防竞态（过期响应被丢弃）。
 */
export default class PaginatedList<T = any> {
  items: T[] = [];
  loading: boolean = false;
  private moreResults: boolean = false;
  private requestSeq: number = 0;
  private options: IPaginatedListOptions;

  constructor(options: IPaginatedListOptions) {
    this.options = options;
  }

  hasMore(): boolean {
    return this.moreResults;
  }

  /** 重新加载：清空列表后从第一页加载 */
  refresh(): Promise<any> {
    this.items = [];
    return this.load(0);
  }

  /** 加载下一页并追加 */
  loadMore(): Promise<any> {
    return this.load(this.items.length);
  }

  private load(offset: number): Promise<any> {
    this.loading = true;
    const seq = ++this.requestSeq;
    const query: Record<string, any> = { page: { offset } };
    if (this.options.params) {
      Object.assign(query, this.options.params());
    }

    return app.store
      .find(this.options.endpoint, query)
      .then((results: any) => {
        if (seq !== this.requestSeq) return results;
        this.moreResults = !!(results.payload.links && results.payload.links.next);
        this.items.push(...results.payload.data);
        this.loading = false;
        m.redraw();
        return results;
      })
      .catch(() => {
        if (seq !== this.requestSeq) return;
        this.loading = false;
        if (offset === 0 && this.options.clearItemsOnRefreshError) {
          this.items = [];
        }
        m.redraw();
      });
  }
}
