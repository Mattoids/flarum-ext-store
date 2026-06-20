import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';

interface CartItemAttrs extends Record<string, any> {
  item: StoreApiResource;
}

type StatusKey = 0 | 1 | 2 | 9;

export default class CartItem extends Component<CartItemAttrs> {
  private cartData: StoreItemData = {} as StoreItemData;
  private params: Record<string, any> = {};
  private loading: boolean = false;

  oninit(vnode: Mithril.Vnode<CartItemAttrs, this>) {
    super.oninit(vnode);

    this.cartData = this.attrs.item.attributes;
    this.params.id = this.attrs.item.id;
  }

  view() {
    const statusStr: Record<StatusKey, { class: string; key: string }> = {
      0: { class: '', key: 'mattoid-store.lib.item-cart-status-0' },
      1: { class: 'color-green', key: 'mattoid-store.lib.item-cart-status-1' },
      2: { class: 'color-red', key: 'mattoid-store.lib.item-cart-status-2' },
      9: { class: 'color-coral', key: 'mattoid-store.lib.item-cart-status-9' },
    };

    const moneyName = (app.forum.attribute('antoinefr-money.moneyname') || '[money]') as string;
    const price =
      (this.cartData.price || 0) > 0 ? moneyName.replace('[money]', String(this.cartData.price)) : app.translator.trans('mattoid-store.forum.free');
    const payAmt =
      (this.cartData.payAmt || 0) > 0 ? moneyName.replace('[money]', String(this.cartData.payAmt)) : app.translator.trans('mattoid-store.forum.free');

    const status = (this.cartData.status as StatusKey) || 0;
    const isLimit = this.cartData.type === 'limit';
    const autoDeductionLabel = this.cartData.autoDeduction
      ? app.translator.trans('mattoid-store.lib.item-cart-yes')
      : app.translator.trans('mattoid-store.lib.item-cart-no');

    return (
      <div className="frame">
        <div className="row margin-top-10">
          <div className="col-md-10">
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-title')}: </label>{' '}
              <span className="color-green">{this.cartData.title}</span>
              {this.cartData.orphaned && (
                <span className="color-red" style="margin-left:6px;">
                  [{app.translator.trans('mattoid-store.lib.item-cart-orphaned')}]
                </span>
              )}
              &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-pay-amt')}: </label>{' '}
              <span className="color-red">{payAmt}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-price')}: </label> <span>{price}</span>
            </div>
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-status')}: </label>
              <span className={statusStr[status].class}>{app.translator.trans(statusStr[status].key)}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-type')}: </label>{' '}
              <span>{app.translator.trans(isLimit ? 'mattoid-store.lib.item-cart-type-limit' : 'mattoid-store.lib.item-cart-type-permanent')}</span>
              {isLimit && (
                <>
                  &nbsp;|&nbsp;
                  <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-outtime')}: </label>
                  <span>{this.cartData.outtime}</span>
                </>
              )}
            </div>
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-auto-deduction')}: </label>
              <span className={this.cartData.autoDeduction ? 'color-green' : 'color-red'}>{autoDeductionLabel}</span> &nbsp;|&nbsp;
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-created')}: </label>{' '}
              <span>{this.cartData.createdAt}</span>
            </div>
          </div>
          <div className="col-md-2" style="height: 71px;line-height: 71px;">
            {this.cartData.enableType === 1 && !this.cartData.orphaned
              ? Button.component(
                  {
                    type: 'submit',
                    className: 'Button Button--primary margin-left-30',
                    loading: this.loading,
                    onclick: (e: Event) => this.onsubmit(e),
                  },
                  app.translator.trans(!this.cartData.enable ? 'mattoid-store.lib.item-cart-button-use' : 'mattoid-store.lib.item-cart-button-cancel')
                )
              : ''}
          </div>
        </div>
      </div>
    );
  }

  onsubmit(event: Event) {
    event.preventDefault();
    this.loading = true;

    app
      .request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/store/use/goods',
        body: this.params,
      })
      .then(
        () => location.reload(),
        () => {
          this.loading = false;
        }
      );
  }
}
