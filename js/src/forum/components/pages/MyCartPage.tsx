import app from 'flarum/forum/app';

import UserPage from 'flarum/forum/components/UserPage';
import CartItem from "../component/CartItem";
import Button from 'flarum/components/Button';
import Select from "flarum/common/components/Select";
import Stream from "flarum/common/utils/Stream";

export default class MyCartPage extends UserPage {

  private type: number = Stream("");
  private status: number = Stream("-1");
  private autoDeduction: number = Stream("-1");
  private cartList: any = []
  private moreResults: boolean = false

  oninit(vnode) {
    super.oninit(vnode);

    this.loadUser(m.route.param('username'));

    this.loadResults();
  }

  content() {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store.forum.cart')}</h2>
        <div>
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
              }}
              onchange={(e) => {
                this.status(e)
                this.cartList = []
                this.loadResults()
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
                'permanent': app.translator.trans('mattoid-store.lib.item-cart-type-permanent'),
                'limit': app.translator.trans('mattoid-store.lib.item-cart-type-limit'),
              }}
              onchange={(e) => {
                this.type(e)
                this.cartList = []
                this.loadResults()
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
              onchange={(e) => {
                this.autoDeduction(e)
                this.cartList = []
                this.loadResults()
              }}
            />
          </div>
        </div>
        <div>
          {
            this.cartList.map((item) => {
              return (
                <div className="">
                  {CartItem.component({item})}
                </div>
              );
            })
          }

          {!this.loading && this.cartList.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.lib.list-empty')}
              </div>
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

  parseResults(results) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    [].push.apply(this.cartList, results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadResults(offset = 0) {
    const filters = {
      'type': this.type(),
      'status': this.status(),
      'autoDeduction': this.autoDeduction()
    };
    return app.store
      .find("/store/cart/list", {
        filter: filters,
        page: {
          offset,
        },
      })
      .catch(() => {
      })
      .then(this.parseResults.bind(this));
  }
}
