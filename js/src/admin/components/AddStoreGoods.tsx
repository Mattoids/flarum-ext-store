import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import StoreGoodsDetailModal from './StoreGoodsDetailModal';

export default class AddStoreGoods extends Modal {
  private goodsList: GoodsTypeResource[] = [];
  private moreResults: boolean = false;

  oninit(vnode: Mithril.Vnode<IInternalModalAttrs, this>) {
    super.oninit(vnode);

    this.loadResults();
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.add-store-goods');
  }

  className(): string {
    return '';
  }

  content() {
    return (
      <div>
        {this.goodsList.map((item: GoodsTypeResource, index: number) => (
          <div className="storeItemContainer" style="margin: 10px">
            <div className="ExtensionPage-body">
              <div className="ExtensionPage-settings FlarumBadgesPage" style="margin-top: 10px">
                <div className="container">
                  <span className="leftAligned" style="padding: 8px">
                    {item.attributes.name}
                  </span>
                  <Button
                    className="Button rightAligned"
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
            </div>
          </div>
        ))}

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
