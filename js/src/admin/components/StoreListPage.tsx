import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import  Mithril from 'mithril';
import AddStoreGoods from "./AddStoreGoods";
import Select from "flarum/common/components/Select";
import Stream from 'flarum/common/utils/Stream';
import StoreListItem from "./StoreListItem";

export default class StoreListPage extends ExtensionPage {

  private storeList: any = []
  private moreResults: boolean = false

  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);

    this.status = Stream('-1');
    this.type = Stream('-1');

    this.loadResults();
  }

  content() {
    return (
      <div className="ExtensionPage-body">
        <div className="ExtensionPage-settings FlarumBadgesPage">
          <div className="container">
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
                setting: 'mattoid-store.storeTimezone',
                label: app.translator.trans('mattoid-store.admin.settings.store-timezone'),
                placeholder: 'Asia/Shanghai',
                help: app.translator.trans('mattoid-store.admin.settings.store-timezone-requirement'),
              })}
              {this.submitButton()}
            </form>
            <hr/>
            {this.buildSettingComponent(function () {
                return m('.Form-group', Button.component({
                  className: 'Button',
                  onclick() {
                    app.modal.show(AddStoreGoods);
                  },
                }, app.translator.trans('mattoid-store.admin.settings.add-store-goods')));
            })}
          </div>
          <div className="container">
            <div className="spacing" style="overflow: auto">
              <div style="display: inline-block;">
                <Select
                  value={this.status()}
                  disabled={this.loading}
                  options={{
                    '-1': app.translator.trans('mattoid-store.lib.item-status-all'),
                    '1': app.translator.trans('mattoid-store.lib.item-status-up'),
                    '0': app.translator.trans('mattoid-store.lib.item-status-down')
                  }}
                  buttonClassName="Button"
                  onchange={(e) => {
                    this.status(e)
                    this.storeList = []
                    this.loadResults()
                  }}
                />
              </div>
              <div style=" display: inline-block; margin-left: 26px;">
                <Select
                  value={this.type()}
                  disabled={this.loading}
                  options={{
                    '-1': app.translator.trans('mattoid-store.lib.item-type-all'),
                    'permanent': app.translator.trans('mattoid-store.lib.item-type-permanent'),
                    'limit': app.translator.trans('mattoid-store.lib.item-type-limit'),
                  }}
                  buttonClassName="Button"
                  onchange={(e) => {
                    this.type(e)
                    this.storeList = []
                    this.loadResults()
                  }}
                />
              </div>
            </div>
            <ul style="padding:0px;list-style-type: none;">
              {
                this.storeList.map((item) => {
                  return (
                    <li style="margin-top:5px;background: var(--body-bg);">
                      {StoreListItem.component({ item })}
                    </li>
                  );
                })
              }
            </ul>

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

          </div>
        </div>
      </div>
    )
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
    const filters = {
      type: this.type(),
      status: this.status()
    };

    return app.store
      .find("/store/list", {
        filter:filters,
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }
}
