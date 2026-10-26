import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';
import AddStoreGoods from './AddStoreGoods';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import StoreListItem from './StoreListItem';
import LoadingBlock from './LoadingBlock';
import PaginatedList from './PaginatedList';

export default class StoreListPage extends ExtensionPage {
  private list: PaginatedList<StoreApiResource> = new PaginatedList({
    endpoint: '/store/list',
    params: () => ({
      filter: {
        type: this.type(),
        status: this.status(),
      },
    }),
  });
  private status: Stream<string> = Stream('-1');
  private type: Stream<string> = Stream('-1');

  oninit(vnode: Mithril.Vnode<any, this>) {
    super.oninit(vnode);

    this.list.refresh();
  }

  content() {
    return (
      <div className="ExtensionPage-body">
        <div className="ExtensionPage-settings FlarumBadgesPage">
          <div className="container">
            <div className="StoreAdminPanel">
              <div className="StoreAdminPanel-title">{app.translator.trans('mattoid-store.admin.settings.section-settings')}</div>
              <form>
                {this.buildSettingComponent({
                  type: 'string',
                  setting: 'mattoid-store.storeName',
                  label: app.translator.trans('mattoid-store.admin.settings.store-name'),
                  placeholder: app.translator.trans('mattoid-store.admin.settings.store-name'),
                  help: app.translator.trans('mattoid-store.admin.settings.store-name-requirement'),
                })}
                {this.buildSettingComponent({
                  type: 'string',
                  setting: 'mattoid-store.moneyName',
                  label: app.translator.trans('mattoid-store.admin.settings.money-name'),
                  placeholder: '[money]',
                  help: app.translator.trans('mattoid-store.admin.settings.money-name-requirement'),
                })}
                {this.buildSettingComponent({
                  type: 'string',
                  setting: 'mattoid-store.storeTimezone',
                  label: app.translator.trans('mattoid-store.admin.settings.store-timezone'),
                  placeholder: 'Asia/Shanghai',
                  help: app.translator.trans('mattoid-store.admin.settings.store-timezone-requirement'),
                })}
                {this.submitButton()}
              </form>
            </div>
          </div>

          <div className="container">
            <div className="StoreAdminPanel">
              <div className="StoreAdminPanel-title">
                {app.translator.trans('mattoid-store.admin.settings.section-goods')}
                <Button
                  className="Button Button--primary StoreAdminPanel-add"
                  onclick={() => app.modal.show(AddStoreGoods, { onChanged: () => this.refreshList() })}
                >
                  {app.translator.trans('mattoid-store.admin.settings.add-store-goods')}
                </Button>
              </div>

              <div className="StoreAdminToolbar">
                <div>
                  <Select
                    value={this.status()}
                    disabled={this.list.loading}
                    options={{
                      '-1': app.translator.trans('mattoid-store.lib.item-status-all'),
                      '1': app.translator.trans('mattoid-store.lib.item-status-up'),
                      '0': app.translator.trans('mattoid-store.lib.item-status-down'),
                      trashed: app.translator.trans('mattoid-store.lib.item-status-trashed'),
                    }}
                    onchange={(e: string) => {
                      this.status(e);
                      this.refreshList();
                    }}
                  />
                </div>
                <div>
                  <Select
                    value={this.type()}
                    disabled={this.list.loading}
                    options={{
                      '-1': app.translator.trans('mattoid-store.lib.item-type-all'),
                      permanent: app.translator.trans('mattoid-store.lib.item-type-permanent'),
                      limit: app.translator.trans('mattoid-store.lib.item-type-limit'),
                    }}
                    onchange={(e: string) => {
                      this.type(e);
                      this.refreshList();
                    }}
                  />
                </div>
              </div>

              <ul className="StoreAdminList">
                {this.list.items.map((item: StoreApiResource) => {
                  return <li key={item.id}>{StoreListItem.component({ item, onChanged: () => this.refreshList() })}</li>;
                })}
              </ul>

              {!this.list.loading && this.list.items.length === 0 && (
                <div>
                  <div className="StoreAdminEmpty">{app.translator.trans('mattoid-store.lib.list-empty')}</div>
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
   * 商品新增/编辑/删除后局部刷新列表（替代整页 reload）
   */
  refreshList() {
    this.list.refresh();
  }
}
