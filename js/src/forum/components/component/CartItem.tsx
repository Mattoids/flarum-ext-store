import app from 'flarum/forum/app';
import Component from "flarum/Component";
import Button from "flarum/common/components/Button";

export default class StoreItem extends Component {

  private cartData: any = {};
  private params: any = {};

  oninit(vnode) {
    super.oninit(vnode);

    this.cartData = this.attrs.item.attributes;
    this.params.id = this.attrs.item.id;
  }

  view() {
    const statusStr = {
      0: {
        class: '',
        value: '未支付'
      },
      1: {
        class: 'color-green',
        value: '已支付'
      },
      2: {
        class: 'color-red',
        value: '已失效'
      },
      9: {
        class: 'color-coral',
        value: '超时失效'
      }
    }
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = this.cartData.price > 0 ? moneyName.replace('[money]', this.cartData.price) : app.translator.trans('mattoid-store.forum.free');
    const payAmt = this.cartData.payAmt > 0 ? moneyName.replace('[money]', this.cartData.payAmt) : app.translator.trans('mattoid-store.forum.free');
    return (
      <div className="frame">
        <div className="row margin-top-10">
          <div className="col-md-10">
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-title')}: </label> <span className="color-green">{this.cartData.title}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-pay-amt')}: </label> <span className="color-red">{payAmt}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-price')}: </label> <span className="">{price}</span>
            </div>
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-status')}: </label>
              <span
                className={statusStr[this.cartData.status].class}>{statusStr[this.cartData.status].value}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-type')}: </label> <span
              className={this.cartData.type == 'limit' ? '' : ''}>{this.cartData.type == 'limit' ? "限时有效" : "永久有效"}</span> &nbsp;|&nbsp;
              {
                this.cartData.type == 'limit' ?
                  (<span>
                    <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-outtime')}: </label>
                    <span>{this.cartData.outtime}</span>
                  </span>) : ""
              }
            </div>
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-auto-deduction')}: </label> <span
              className={this.cartData.autoDeduction == 0 ? "color-red" : "color-green"}>{this.cartData.autoDeduction == 0 ? "否" : "是" }</span>
            </div>
          </div>
          <div className="col-md-2" style="height: 71px;line-height: 71px;">
            {
              this.cartData.enableType == 1 ?
              Button.component({
                type: 'submit',
                className: 'Button Button--primary margin-left-30',
                loading: this.loading,
                onclick: (e) => {
                  this.onsubmit(e)
                }
              }, app.translator.trans(this.cartData.enable == 0 ? 'mattoid-store.lib.item-cart-button-use' : 'mattoid-store.lib.item-cart-button-cancel'))
                : ""
            }
          </div>
        </div>
      </div>
    )
  }

  onsubmit(event: Event) {
    event.preventDefault();
    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/store/use/goods',
      body: this.params
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        // this.handleErrors(result);
      });
  }
}
