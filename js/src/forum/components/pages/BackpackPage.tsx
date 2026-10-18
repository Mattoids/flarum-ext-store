import app from 'flarum/forum/app';
import type Mithril from 'mithril';

import UserPage from 'flarum/forum/components/UserPage';
import Button from 'flarum/common/components/Button';
import BackpackItem from '../component/BackpackItem';

export default class BackpackPage extends UserPage {
  private items: StoreApiResource[] = [];
  private loading: boolean = false;
  private moreResults: boolean = false;

  oninit(vnode: Mithril.Vnode<any, this>) {
    super.oninit(vnode);

    this.loadUser(m.route.param('username'));

    this.items = [];
    this.loadResults();
  }

  content(): Mithril.Children {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store.forum.backpack')}</h2>
        <div className="Store-Body Backpack-Body">
          {this.items.map((item: StoreApiResource) => {
            return (
              <div className="storeItemContainer backpackItemContainer" key={item.id}>
                {BackpackItem.component({ item: item, onChanged: () => this.loadResults() })}
              </div>
            );
          })}

          {!this.loading && this.items.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.lib.backpack-empty')}
              </div>
            </div>
          )}

          {!this.loading && this.moreResults && (
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
    );
  }

  loadMore() {
    this.loadResults(false);
  }

  loadResults(reset = true) {
    if (reset) {
      this.items = [];
    }
    this.loading = true;
    return app.store
      .find('/store/backpack/list', {
        page: {
          offset: reset ? 0 : this.items.length,
        },
      })
      .then((results: any) => {
        if (results && results.payload && results.payload.data) {
          this.items.push(...results.payload.data);
        }
        this.moreResults = !!results?.payload?.links && !!results.payload.links.next;
        this.loading = false;
        m.redraw();
        return results;
      })
      .catch(() => {
        if (reset) {
          this.items = [];
        }
        this.loading = false;
        m.redraw();
      });
  }
}
