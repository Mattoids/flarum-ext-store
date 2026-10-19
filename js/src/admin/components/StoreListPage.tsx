import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';
import AddStoreGoods from './AddStoreGoods';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import StoreListItem from './StoreListItem';

export default class StoreListPage extends ExtensionPage {
  private storeList: StoreApiResource[] = [];
  private moreResults: boolean = false;
  private status: Stream<string> = Stream('-1');
  private type: Stream<string> = Stream('-1');

  oninit(vnode: Mithril.Vnode<any, this>) {
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
                <Button className="Button Button--primary StoreAdminPanel-add" onclick={() => app.modal.show(AddStoreGoods)}>
                  {app.translator.trans('mattoid-store.admin.settings.add-store-goods')}
                </Button>
              </div>

              <div className="StoreAdminToolbar">
                <div>
                  <Select
                    value={this.status()}
                    disabled={this.loading}
                    options={{
                      '-1': app.translator.trans('mattoid-store.lib.item-status-all'),
                      '1': app.translator.trans('mattoid-store.lib.item-status-up'),
                      '0': app.translator.trans('mattoid-store.lib.item-status-down'),
                    }}
                    onchange={(e: string) => {
                      this.status(e);
                      this.storeList = [];
                      this.loadResults();
                    }}
                  />
                </div>
                <div>
                  <Select
                    value={this.type()}
                    disabled={this.loading}
                    options={{
                      '-1': app.translator.trans('mattoid-store.lib.item-type-all'),
                      permanent: app.translator.trans('mattoid-store.lib.item-type-permanent'),
                      limit: app.translator.trans('mattoid-store.lib.item-type-limit'),
                    }}
                    onchange={(e: string) => {
                      this.type(e);
                      this.storeList = [];
                      this.loadResults();
                    }}
                  />
                </div>
              </div>

              <ul className="StoreAdminList">
                {this.storeList.map((item: StoreApiResource) => {
                  return <li>{StoreListItem.component({ item })}</li>;
                })}
              </ul>

              {!this.loading && this.storeList.length === 0 && (
                <div>
                  <div className="StoreAdminEmpty">{app.translator.trans('mattoid-store.lib.list-empty')}</div>
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

  hasMoreResults() {
    return this.moreResults;
  }

  loadMore() {
    this.loading = true;
    this.loadResults(this.storeList.length);
  }

  parseResults(results: any) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    this.storeList.push(...results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    this.loading = true;
    const filters = {
      type: this.type(),
      status: this.status(),
    };

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
