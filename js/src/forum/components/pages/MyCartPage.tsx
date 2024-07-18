import app from 'flarum/forum/app';
import UserPage from 'flarum/forum/components/UserPage';
import CartItem from "../component/CartItem";
import Button from 'flarum/components/Button';
import Select from "flarum/common/components/Select";

export default class StorePage<CustomAttrs> extends UserPage {

  private cartList: any = []
  private moreResults: boolean = false

  oncreate(vnode) {
    super.oncreate(vnode);

    this.loadResults();
  }

  view() {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store-invite.forum.cart')}</h2>
        <div>
          <div className="Invite-Input">
            <Select
              style="width: 150px"
              value={this.status()}
              disabled={this.loading}
              options={{
                '-1': app.translator.trans('mattoid-store-invite.lib.item-status-all'),
                '0': app.translator.trans('mattoid-store-invite.lib.item-status-confirm'),
                '1': app.translator.trans('mattoid-store-invite.lib.item-status-adopt'),
                '2': app.translator.trans('mattoid-store-invite.lib.item-status-refuse'),
              }}
              onchange={(e) => {
                this.status(e)
                this.inviteList = []
                this.loadResults()
              }}
            />
          </div>
          <div>
            {
              this.cartList.map(item => {
                CartItem.component({ item });
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
      </div>
    )
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

    };

    return app.store
      .find("/store/cart/list", {
        filter:filters,
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }
}
