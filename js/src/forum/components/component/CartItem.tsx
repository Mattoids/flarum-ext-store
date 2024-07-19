import app from 'flarum/forum/app';
import Component from "flarum/Component";

export default class StoreItem extends Component {

  private cartData: any = {};

  oninit(vnode) {
    super.oninit(vnode);

    this.cartData = this.attrs.item.attributes
  }

  view() {
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = this.cartData.price > 0 ? moneyName.replace('[money]', this.cartData.price) : app.translator.trans('mattoid-store.forum.free');
    const payAmt = this.cartData.payAmt > 0 ? moneyName.replace('[money]', this.cartData.payAmt) : app.translator.trans('mattoid-store.forum.free');
    return (
      <div>
        {this.cartData.title}
        {price}
        {payAmt}

        <span
          style={this.cartData.type === 'limit' ? 'display:inline-block' : 'display: none'}>({this.cartData.outtime}{app.translator.trans('mattoid-store.forum.days')})</span>
        <span
          style={this.cartData.type === 'limit' && this.cartData.autoDeduction ? 'display:inline-block' : 'display: none'}>&nbsp;|&nbsp;{app.translator.trans('mattoid-store.lib.item-invalid', {'day': this.cartData.outtime})}</span>
      </div>
    )
  }

  onsubmit(event: Event) {
  }
}
