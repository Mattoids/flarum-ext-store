import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import extractText from 'flarum/common/utils/extractText';
import StoreGoodsDetailModal from './StoreGoodsDetailModal';

export default class AddStoreGoods extends Modal {
  private goodsList: GoodsTypeResource[] = [];
  private moreResults: boolean = false;
  private search: string = '';

  oninit(vnode: Mithril.Vnode<IInternalModalAttrs, this>) {
    super.oninit(vnode);

    this.loadResults();
  }

  title(): Mithril.Children {
    return app.translator.trans('mattoid-store.admin.settings.add-store-goods');
  }

  className(): string {
    return 'Modal--large';
  }

  filteredGoodsList() {
    const keyword = this.search.trim().toLowerCase();
    if (!keyword) {
      return this.goodsList;
    }
    return this.goodsList.filter((item: GoodsTypeResource) => {
      const name = (item.attributes.name || '').toLowerCase();
      const code = (item.attributes.code || '').toLowerCase();
      return name.indexOf(keyword) !== -1 || code.indexOf(keyword) !== -1;
    });
  }

  content(): Mithril.Children {
    const goodsList = this.filteredGoodsList();

    return (
      <div>
        <div className="StorePluginSearch">
          <input
            className="FormControl"
            type="text"
            value={this.search}
            placeholder={extractText(app.translator.trans('mattoid-store.admin.settings.search-goods-placeholder'))}
            oninput={(e: InputEvent) => {
              this.search = (e.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div className="StorePluginGridScroll">
          <div className="StorePluginGrid">
            {goodsList.map((item: GoodsTypeResource, index: number) => (
              <div className="StorePluginCard">
                <div className="StorePluginCard-title">{item.attributes.name}</div>
                <div className="StorePluginCard-icon">
                  {item.attributes.icon ? (
                    <img src={item.attributes.icon} alt="" />
                  ) : item.attributes.extIcon && (item.attributes.extIcon.name || item.attributes.extIcon.backgroundImage) ? (
                    <span
                      className="StorePluginCard-extIcon"
                      style={{
                        backgroundColor: item.attributes.extIcon.backgroundColor,
                        color: item.attributes.extIcon.color,
                        backgroundImage: item.attributes.extIcon.backgroundImage,
                      }}
                    >
                      {item.attributes.extIcon.name ? <i className={item.attributes.extIcon.name} /> : ''}
                    </span>
                  ) : (
                    <i className="fas fa-puzzle-piece" />
                  )}
                </div>
                <div className="StorePluginCard-tags">
                  <span className="StoreCodeChip">{item.attributes.code}</span>
                  {(item.attributes.itemTypes || []).map((t: any) => (
                    <span className="StorePluginRow-tag">{app.translator.trans(t.name || t.key)}</span>
                  ))}
                </div>
                <div className="StorePluginCard-footer">
                  <Button
                    className="Button Button--primary"
                    onclick={() => {
                      app.modal.show(StoreGoodsDetailModal, {
                        code: item.attributes.code,
                        title: item.attributes.name,
                      });
                    }}
                  >
                    {app.translator.trans('mattoid-store.admin.settings.add-store-goods')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!this.loading && this.goodsList.length > 0 && goodsList.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.lib.list-empty')}
              </div>
            </div>
          )}
        </div>

        {!this.loading && this.goodsList.length === 0 && (
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
    );
  }

  hasMoreResults() {
    return this.moreResults;
  }

  loadMore() {
    this.loading = true;
    this.loadResults(this.goodsList.length);
  }

  parseResults(results: any) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    this.goodsList.push(...results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    this.loading = true;
    const filters = {};

    return app.store
      .find('/store/goods', {
        filter: filters,
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }
}
