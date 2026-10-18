import Component from "flarum/common/Component";

export default class StoreItem extends Component {

  private cartData: any = {};

  oninit(vnode) {
    super.oninit(vnode);

    this.cartData = this.attrs.item.attributes;
  }

  view() {
    const statusMeta = {
      0: {class: 'StoreBadge StoreBadge--muted', key: 'mattoid-store.lib.item-cart-status-0'},
      1: {class: 'StoreBadge StoreBadge--success', key: 'mattoid-store.lib.item-cart-status-1'},
      2: {class: 'StoreBadge StoreBadge--error', key: 'mattoid-store.lib.item-cart-status-2'},
      3: {class: 'StoreBadge StoreBadge--info', key: 'mattoid-store.lib.item-cart-status-3'},
      9: {class: 'StoreBadge StoreBadge--warning', key: 'mattoid-store.lib.item-cart-status-9'},
    }
    const status = statusMeta[this.cartData.status] || statusMeta[2];
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = this.cartData.price > 0 ? moneyName.replace('[money]', this.cartData.price) : app.translator.trans('mattoid-store.forum.free');
    const payAmt = this.cartData.payAmt > 0 ? moneyName.replace('[money]', this.cartData.payAmt) : app.translator.trans('mattoid-store.forum.free');
    return (
      <div className="frame">
        <div className="row margin-top-10">
          <div className="col-md-12">
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-title')}: </label> <span className="color-green">{this.cartData.title}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-pay-amt')}: </label> <span className="color-red">{payAmt}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-price')}: </label> <span className="">{price}</span>
            </div>
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-status')}: </label>
              <span className={status.class}>{app.translator.trans(status.key)}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-type')}: </label> <span
              className="">{app.translator.trans(this.cartData.type == 'limit' ? 'mattoid-store.lib.item-cart-type-limit' : 'mattoid-store.lib.item-cart-type-permanent')}</span> &nbsp;|&nbsp;
              {
                this.cartData.type == 'limit' ?
                  (<span>
                    <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-outtime')}: </label>
                    <span>{this.cartData.outtime}</span>
                  </span>) : ""
              }
            </div>
            <div>
              <label
                className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-auto-deduction')}: </label>
              <span
                className={this.cartData.autoDeduction == 0 ? "color-red" : "color-green"}>{app.translator.trans(this.cartData.autoDeduction == 0 ? 'mattoid-store.lib.item-cart-auto-deduction-0' : 'mattoid-store.lib.item-cart-auto-deduction-1')}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-created')}: </label> <span
              className="">{this.cartData.createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
