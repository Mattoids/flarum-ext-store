import IndexPage from 'flarum/forum/components/IndexPage';
import { IPageAttrs } from 'flarum/common/components/Page';
import listItems from 'flarum/common/helpers/listItems';
import Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import Select from 'flarum/common/components/Select';
import StoreItem from '../component/StoreItem';

export interface IIndexPageAttrs extends IPageAttrs {}

const FILTER_KEYS = ['code', 'group', 'subtype', 'type', 'discount'];

export default class StorePage<CustomAttrs extends IIndexPageAttrs = IIndexPageAttrs> extends IndexPage {
  private storeList: any = [];
  private moreResults: boolean = false;
  private filterValues: any = { group: '-1', code: '-1', subtype: '-1', type: '-1', discount: '-1' };
  private dimensions: any = [];
  private status: any = Stream('1');

  oninit(vnode: Mithril.Vnode<CustomAttrs, this>) {
    super.oninit(vnode);

    app.setTitle(app.forum.attribute('storeName') || app.translator.trans('mattoid-store.forum.tital'));
    app.setTitleCount(0);
  }

  oncreate(vnode: Mithril.VnodeDOM<CustomAttrs, this>) {
    super.oncreate(vnode);

    this.loadOptions();
    this.loadResults();
  }

  view() {
    return (
      <div className="IndexPage">
        <div className="container">
          <div className="sideNavContainer">
            <nav className="IndexPage-nav sideNav">
              <ul>{listItems(this.sidebarItems().toArray())}</ul>
            </nav>
            <div className="StorePage-results sideNavOffset">
              <h2 class="BadgeOverviewTitle">{app.forum.attribute('storeName') || app.translator.trans('mattoid-store.forum.tital')}</h2>
              {this.renderFilterBar()}
              <div className="Store-Body">
                {this.storeList.map((item) => {
                  if (this.canViewGoodsItem(item)) {
                    return (
                      <div className="storeItemContainer" key={item.id}>
                        {StoreItem.component({ item, onSuccess: (data) => this.onItemBought(item, data) })}
                      </div>
                    );
                  }
                })}
              </div>

              {!this.loading && this.storeList.length === 0 && (
                <div>
                  <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                    {app.translator.trans('mattoid-store.lib.list-empty')}
                  </div>
                </div>
              )}

              {!this.loading && this.hasMoreResults() && (
                <div style="text-align:center;padding:20px">
                  <Button className={'Button Button--primary'} disabled={this.loading} loading={this.loading} onclick={() => this.loadMore()}>
                    {app.translator.trans('mattoid-store.lib.list-load-more')}
                  </Button>
                </div>
              )}

              {this.loading && (
                <div class="DiscussionList">
                  <div class="DiscussionList-loadMore">
                    <div
                      aria-label="loading…"
                      role="status"
                      data-size="medium"
                      class="LoadingIndicator-container LoadingIndicator-container--block LoadingIndicator-container--medium"
                    >
                      <div aria-hidden="true" class="LoadingIndicator"></div>
                    </div>
                  </div>
                </div>
              )}
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
  canViewGoodsItem(item) {
    const attrs = item.attributes;
    if (!attrs.hide) return true;
    const user = app.session.user;
    if (!user) return false;
    const attr = 'can' + attrs.code.charAt(0).toUpperCase() + attrs.code.slice(1) + 'View';
    return !!user.attribute(attr);
  }

  /**
   * 购买成功：局部扣减列表中的库存，避免整页刷新
   */
  onItemBought(item, data) {
    const attrs = item.attributes;
    if (attrs.stock != -99 && attrs.stock > 0) {
      attrs.stock = attrs.stock - 1;
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
        {this.dimensions.map((dim) => {
          if (dim.hidden) return null;

          const options = { '-1': app.translator.trans('mattoid-store.lib.filter-all') };
          (dim.options || []).forEach((opt) => {
            options[opt.value] = opt.label;
          });

          return (
            <span>
              <Select
                style="min-width: 130px"
                value={this.filterValues[dim.key] || '-1'}
                disabled={this.loading}
                options={options}
                onchange={(e) => this.onFilterChange(dim.key, e)}
              />
            </span>
          );
        })}
      </div>
    );
  }

  onFilterChange(key, value) {
    const idx = FILTER_KEYS.indexOf(key);
    if (idx === -1) return;

    // 本级变更，其后所有级重置为“全部”
    this.filterValues[key] = value;
    FILTER_KEYS.slice(idx + 1).forEach((k) => {
      this.filterValues[k] = '-1';
    });

    this.storeList = [];
    this.loadOptions();
    this.loadResults();
  }

  loadOptions() {
    return app
      .request({
        method: 'GET',
        url: app.forum.attribute('apiUrl') + '/store/filter/options',
        params: { filter: this.filterValues },
      })
      .then((result) => {
        // JSON:API 响应体：data.attributes.dimensions
        const attrs = result && result.data ? result.data.attributes : null;
        this.dimensions = (attrs && attrs.dimensions) || [];
        m.redraw();
      })
      .catch(() => {
        this.dimensions = [];
      });
  }

  hasMoreResults() {
    return this.moreResults;
  }

  loadMore() {
    this.loading = true;
    this.loadResults(this.storeList.length);
  }

  parseResults(results) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    [].push.apply(this.storeList, results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    this.loading = true;
    const filters = Object.assign(
      {
        status: this.status(),
      },
      this.filterValues
    );

    return app.store
      .find('/store/list', {
        filter: filters,
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }
}
