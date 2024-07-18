import IndexPage from "flarum/forum/components/IndexPage";
import { IPageAttrs } from 'flarum/common/components/Page';
import listItems from 'flarum/common/helpers/listItems';
import Mithril from 'mithril';
import Button from "flarum/common/components/Button";
import Stream from "flarum/common/utils/Stream";
import StoreItem from "../component/StoreItem";

export interface IIndexPageAttrs extends IPageAttrs {}

export default class StorePage<CustomAttrs extends IIndexPageAttrs = IIndexPageAttrs> extends IndexPage {

  private storeList: any = []
  private moreResults: boolean = false

  oncreate(vnode: Mithril.VnodeDOM<CustomAttrs, this>) {
    super.oncreate(vnode);

    app.setTitle(app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital'));
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
              <h2 class="BadgeOverviewTitle">{app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital')}</h2>
              <div className="Store-Body">
                {
                  this.storeList.map((item) => {
                    if (!item.attributes.hide || app.session.user.attribute('can'+item.attributes.code.slice(0, 1).toUpperCase()+item.attributes.code.slice(1)+'View')) {
                      return (
                        <div className="storeItemContainer">
                          {StoreItem.component({ item })}
                        </div>
                      );
                    }
                  })
                }
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

            </div>
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
