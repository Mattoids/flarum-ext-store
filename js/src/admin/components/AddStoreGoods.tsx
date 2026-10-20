import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import extractText from 'flarum/common/utils/extractText';
import StoreGoodsDetailModal from './StoreGoodsDetailModal';
import LoadingBlock from './LoadingBlock';
import PaginatedList from './PaginatedList';

export interface IAddStoreGoodsAttrs extends IInternalModalAttrs {
  /** 商品保存成功回调（透传自列表页，用于局部刷新列表） */
  onChanged?: () => void;
}

export default class AddStoreGoods extends Modal<IAddStoreGoodsAttrs> {
  private list: PaginatedList<GoodsTypeResource> = new PaginatedList({
    endpoint: '/store/goods',
    params: () => ({ filter: {} }),
  });
  private search: string = '';

  oninit(vnode: Mithril.Vnode<IInternalModalAttrs, this>) {
    super.oninit(vnode);

    this.list.refresh();
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
      return this.list.items;
    }
    return this.list.items.filter((item: GoodsTypeResource) => {
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
            {goodsList.map((item: GoodsTypeResource) => (
              <div className="StorePluginCard" key={item.attributes.code}>
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
                        onSaved: () => {
                          if (this.attrs.onChanged) {
                            this.attrs.onChanged();
                          }
                          this.hide();
                        },
                      });
                    }}
                  >
                    {app.translator.trans('mattoid-store.admin.settings.add-store-goods')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!this.list.loading && this.list.items.length > 0 && goodsList.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.lib.list-empty')}
              </div>
            </div>
          )}
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
    );
  }
}
