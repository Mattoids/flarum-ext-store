import app from 'flarum/forum/app';
import IndexPage from 'flarum/forum/components/IndexPage';
import { IPageAttrs } from 'flarum/common/components/Page';
import listItems from 'flarum/common/helpers/listItems';
import Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import extractText from 'flarum/common/utils/extractText';
import Stream from 'flarum/common/utils/Stream';
import StoreItem from '../component/StoreItem';

export interface IIndexPageAttrs extends Record<string, any> {}

export default class StorePage<CustomAttrs extends IIndexPageAttrs = IIndexPageAttrs> extends IndexPage {
  private storeList: StoreApiResource[] = [];
  private moreResults: boolean = false;
  private status: Stream<string> = Stream('1');
  private type: Stream<string> = Stream('-1');
  private loading: boolean = false;

  oncreate(vnode: Mithril.VnodeDOM<CustomAttrs, this>) {
    super.oncreate(vnode);

    app.setTitle(app.forum.attribute('storeName') || extractText(app.translator.trans('mattoid-store.forum.tital')));
    app.setTitleCount(0);

    this.status = Stream('1');
    this.type = Stream('-1');

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
              <div className="Store-Body">
                {this.storeList.map((item: StoreApiResource) => {
                  if (
                    !item.attributes.hide ||
                    (app.session.user &&
                      app.session.user.attribute('can' + item.attributes.code.slice(0, 1).toUpperCase() + item.attributes.code.slice(1) + 'View'))
                  ) {
                    return <div className="storeItemContainer">{StoreItem.component({ item })}</div>;
                  }
                  return null;
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
