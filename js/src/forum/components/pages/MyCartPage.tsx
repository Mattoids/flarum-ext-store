import app from 'flarum/forum/app';
import type Mithril from 'mithril';

import UserPage from 'flarum/forum/components/UserPage';
import CartItem from '../component/CartItem';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import LoadingBlock from '../component/LoadingBlock';

export default class MyCartPage extends UserPage {
  private type: Stream<string> = Stream('');
  private status: Stream<string> = Stream('1');
  private autoDeduction: Stream<string> = Stream('-1');
  private cartList: StoreApiResource[] = [];
  private moreResults: boolean = false;
  private loading: boolean = false;

  oninit(vnode: Mithril.Vnode<any, this>) {
    super.oninit(vnode);

    this.loadUser(m.route.param('username'));

    this.loadResults();
  }

  content(): Mithril.Children {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store.forum.cart')}</h2>
        <div className="Store-FilterBar">
          <div className="Invite-Input">
            <Select
              style="width: 150px"
              value={this.status()}
              disabled={this.loading}
              options={{
                '-1': app.translator.trans('mattoid-store.lib.item-cart-status-all'),
                '0': app.translator.trans('mattoid-store.lib.item-cart-status-0'),
                '1': app.translator.trans('mattoid-store.lib.item-cart-status-1'),
                '2': app.translator.trans('mattoid-store.lib.item-cart-status-2'),
                '3': app.translator.trans('mattoid-store.lib.item-cart-status-3'),
                '9': app.translator.trans('mattoid-store.lib.item-cart-status-9'),
              }}
              onchange={(e: string) => {
                this.status(e);
                this.cartList = [];
                this.loadResults();
              }}
            />
          </div>
          <div className="Invite-Input">
            <Select
              style="width: 150px"
              value={this.type()}
              disabled={this.loading}
              options={{
                '': app.translator.trans('mattoid-store.lib.item-cart-type-all'),
                permanent: app.translator.trans('mattoid-store.lib.item-cart-type-permanent'),
                limit: app.translator.trans('mattoid-store.lib.item-cart-type-limit'),
              }}
              onchange={(e: string) => {
                this.type(e);
                this.cartList = [];
                this.loadResults();
              }}
            />
          </div>
          <div className="Invite-Input">
            <Select
              style="width: 150px"
              value={this.autoDeduction()}
              disabled={this.loading}
              options={{
                '-1': app.translator.trans('mattoid-store.lib.item-cart-auto-deduction-all'),
                '0': app.translator.trans('mattoid-store.lib.item-cart-auto-deduction-0'),
                '1': app.translator.trans('mattoid-store.lib.item-cart-auto-deduction-1'),
              }}
              onchange={(e: string) => {
                this.autoDeduction(e);
                this.cartList = [];
                this.loadResults();
              }}
            />
          </div>
        </div>
        <div>
          {this.cartList.map((item: StoreApiResource) => {
            return <div>{CartItem.component({ item })}</div>;
          })}

          {!this.loading && this.cartList.length === 0 && (
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

          {this.loading && <LoadingBlock />}
        </div>
      </div>
    );
  }

  hasMoreResults() {
    return this.moreResults;
  }

  loadMore() {
    this.loading = true;
    this.loadResults(this.cartList.length);
  }

  parseResults(results: any) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    this.cartList.push(...results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    this.loading = true;
    const filters = {
      type: this.type(),
      status: this.status(),
      autoDeduction: this.autoDeduction(),
    };
    return app.store
      .find('/store/cart/list', {
        filter: filters,
        page: {
          offset,
        },
      })
      .then(this.parseResults.bind(this))
      .catch(() => {
        this.loading = false;
        m.redraw();
      });
  }
}
