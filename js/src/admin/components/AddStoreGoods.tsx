import app from 'flarum/admin/app';
import Modal, {IInternalModalAttrs} from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import React from "react";
import StoreGoodsDetailModal from "./StoreGoodsDetailModal";

export default class AddStoreGoods extends Modal {
  private goodsList: any = []
  private moreResults: boolean = false

  oninit(vnode) {
    super.oninit(vnode);

    this.loadResults()
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.add-store-goods');
  }

  className(): string {
    return "";
  }

  content() {
    return (
      <div>
        {this.goodsList.map((item: object, index: number) => (
          <div className="storeItemContainer" style="margin: 10px">
            <div className="ExtensionPage-body">
              <div className="ExtensionPage-settings FlarumBadgesPage" style="margin-top: 10px">
                <div className="container">
                  <span className="leftAligned" style="padding: 8px">{item.attributes.name}</span>
                  <Button
                    className="Button rightAligned"
                    onclick={() => {
                      app.modal.show(StoreGoodsDetailModal, {
                        code: item.attributes.code,
                        title: item.attributes.name
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
            <div
              style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">{app.translator.trans("mattoid-store.lib.list-empty")}</div>
          </div>
        )}

        {!this.loading && this.hasMoreResults() && (
          <div style="text-align:center;padding:20px">
            <Button className={'Button Button--primary'} disabled={this.loading} loading={this.loading}
                    onclick={() => this.loadMore()}>
              {app.translator.trans('mattoid-store.lib.list-load-more')}
            </Button>
          </div>
        )}

      </div>
    )
  }


  hasMoreResults() {
    return this.moreResults;
  }

  loadMore() {
    this.loading = true;
    this.loadResults(this.goodsList.length);
  }

  parseResults(results) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    [].push.apply(this.goodsList, results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    const filters = {
    };

    return app.store
      .find("/store/goods", {
        filter:filters,
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }

}
