import app from 'flarum/forum/app';
import IndexPage from 'flarum/forum/components/IndexPage';
import { IPageAttrs } from 'flarum/common/components/Page';
import listItems from 'flarum/common/helpers/listItems';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import Select from 'flarum/common/components/Select';
import extractText from 'flarum/common/utils/extractText';
import StoreItem from '../component/StoreItem';
import LoadingBlock from '../component/LoadingBlock';
import PaginatedList from '../PaginatedList';

export interface IIndexPageAttrs extends IPageAttrs {}

const FILTER_KEYS = ['code', 'group', 'subtype', 'type', 'discount'];

export default class StorePage<CustomAttrs extends IIndexPageAttrs = IIndexPageAttrs> extends IndexPage {
  private list: PaginatedList<StoreApiResource> = new PaginatedList({
    endpoint: '/store/list',
    params: () => ({
      filter: Object.assign(
        {
          status: this.status(),
        },
        this.filterValues
      ),
    }),
  });
  private filterValues: Record<string, string> = { group: '-1', code: '-1', subtype: '-1', type: '-1', discount: '-1' };
  private dimensions: any[] = [];
  private status: Stream<string> = Stream('1');
  // 请求序号：筛选连续变更时丢弃过期响应，防止旧选项覆盖新选项
  private requestSeq: number = 0;

  oninit(vnode: Mithril.Vnode<CustomAttrs, this>) {
    super.oninit(vnode);

    app.setTitle(app.forum.attribute('storeName') || extractText(app.translator.trans('mattoid-store.forum.title')));
    app.setTitleCount(0);
  }

  oncreate(vnode: Mithril.VnodeDOM<CustomAttrs, this>) {
    super.oncreate(vnode);

    this.loadOptions();
    this.list.refresh();
  }

  view() {
    const user = app.session.user;
    // 无浏览权限的用户（如直访 URL）显示无权限提示，而不是静默空列表
    if (!user || !user.attribute('canStoreView')) {
      return (
        <div className="IndexPage">
          <div className="container">
            <div className="StorePage-results sideNavOffset">
              <p className="helpText" style="text-align:center;line-height:100px;">
                {app.translator.trans('mattoid-store.forum.no-permission-buy')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="IndexPage">
        <div className="container">
          <div className="sideNavContainer">
            <nav className="IndexPage-nav sideNav">
              <ul>{listItems(this.sidebarItems().toArray())}</ul>
            </nav>
            <div className="StorePage-results sideNavOffset">
              <h2 class="BadgeOverviewTitle">{app.forum.attribute('storeName') || app.translator.trans('mattoid-store.forum.title')}</h2>
              {this.renderFilterBar()}
              <div className="Store-Body">
                {this.list.items.map((item: StoreApiResource) => {
                  if (this.canViewGoodsItem(item)) {
                    return (
                      <div className="storeItemContainer" key={item.id}>
                        {StoreItem.component({ item, onSuccess: () => this.onItemBought(item) })}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {!this.list.loading && this.list.items.length === 0 && (
                <div>
                  <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                    {app.translator.trans('mattoid-store.lib.list-empty')}
                  </div>
                </div>
              )}

              {!this.list.loading && this.list.hasMore() && (
                <div style="text-align:center;padding:20px">
                  <Button
                    className={'Button Button--primary'}
                    disabled={this.list.loading}
                    loading={this.list.loading}
                    onclick={() => this.list.loadMore()}
                  >
                    {app.translator.trans('mattoid-store.lib.list-load-more')}
                  </Button>
                </div>
              )}

              {this.list.loading && <LoadingBlock />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 隐藏商品可见性：商品插件可注册 can{Code}View 用户属性控制
   * （如 store-invite 插件对邀请类商品的可见性控制）
   */
  canViewGoodsItem(item: StoreApiResource): boolean {
    const attrs = item.attributes;
    if (!attrs.hide) return true;
    const user = app.session.user;
    if (!user) return false;
    const attr = 'can' + attrs.code.charAt(0).toUpperCase() + attrs.code.slice(1) + 'View';
    return !!user.attribute(attr);
  }

  /**
   * 购买成功：局部扣减列表中的库存，避免整页刷新；
   * 统一刷新当前用户余额——不依赖购买弹窗（含插件 priceModal）是否回调 onSuccess
   */
  onItemBought(item: StoreApiResource) {
    const attrs = item.attributes;
    if (attrs.stock != -99 && attrs.stock > 0) {
      attrs.stock = attrs.stock - 1;
    }
    const user = app.session.user;
    if (user) {
      app.store.find('users', user.id()).catch(() => {});
    }
    m.redraw();
  }

  /**
   * 级联筛选栏：维度与选项由 /store/filter/options 提供，
   * 任一级变化时重置其后级并重新拉取选项与商品列表。
   */
  renderFilterBar() {
    if (!this.dimensions.length) return null;

    return (
      <div className="Store-FilterBar" style="margin-bottom: 15px;">
        {this.dimensions.map((dim: any) => {
          if (dim.hidden) return null;

          const options: Record<string, any> = { '-1': app.translator.trans('mattoid-store.lib.filter-all') };
          (dim.options || []).forEach((opt: any) => {
            options[opt.value] = opt.label;
          });

          return (
            <span>
              <Select
                style="min-width: 130px"
                value={this.filterValues[dim.key] || '-1'}
                disabled={this.list.loading}
                options={options}
                onchange={(e: string) => this.onFilterChange(dim.key, e)}
              />
            </span>
          );
        })}
      </div>
    );
  }

  onFilterChange(key: string, value: string) {
    const idx = FILTER_KEYS.indexOf(key);
    if (idx === -1) return;

    // 本级变更，其后所有级重置为“全部”
    this.filterValues[key] = value;
    FILTER_KEYS.slice(idx + 1).forEach((k) => {
      this.filterValues[k] = '-1';
    });

    this.loadOptions();
    this.list.refresh();
  }

  loadOptions() {
    const seq = ++this.requestSeq;
    return app
      .request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/store/filter/options',
        params: { filter: this.filterValues },
      })
      .then((result: any) => {
        if (seq !== this.requestSeq) return;
        // JSON:API 响应体：data.attributes.dimensions
        const attrs = result && result.data ? result.data.attributes : null;
        this.dimensions = (attrs && attrs.dimensions) || [];
        m.redraw();
      })
      .catch(() => {
        if (seq !== this.requestSeq) return;
        this.dimensions = [];
      });
  }
}
