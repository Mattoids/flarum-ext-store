import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import StoreBox from '../modal/StoreBox';
import type Mithril from 'mithril';

export interface IStoreItemAttrs extends Record<string, any> {
  item: StoreApiResource;
}

export default class StoreItem extends Component<IStoreItemAttrs> {
  private storeData: StoreItemData = {} as StoreItemData;

  oninit(vnode: Mithril.Vnode<IStoreItemAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes;
    this.storeData.id = this.attrs.item.id;
  }

  view() {
    const moneyName = String(app.forum.attribute('antoinefr-money.moneyname') || '[money]');
    const price =
      this.storeData.price > 0 ? moneyName.replace('[money]', String(this.storeData.price)) : app.translator.trans('mattoid-store.forum.free');
    const discountPrice = moneyName.replace('[money]', String(this.storeData.discountPrice));

    return (
      <div id={'goods' + this.storeData.id} onclick={() => this.showDetails(this.storeData)}>
        <div className="itemTitle">{this.storeData.title}</div>
        <div className="price spacing">
          {this.storeData.discountPrice > 0 ? (
            <div>
              <span className="price">{discountPrice}</span>&nbsp;
              <span className="discount">{price}</span>
            </div>
          ) : (
            <span className="price">{price}</span>
          )}
        </div>
        <div className="spacing">
          {app.translator.trans('mattoid-store.lib.item-stock')}:{' '}
          {this.storeData.stock == -99 ? app.translator.trans('mattoid-store.forum.infinite') : this.storeData.stock}&nbsp;|&nbsp;
          {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)}&nbsp;
          <span style={this.storeData.type === 'limit' ? 'display:inline-block' : 'display: none'}>
            ({this.storeData.outtime}
            {app.translator.trans('mattoid-store.forum.days')})
          </span>
          <span style={this.storeData.type === 'limit' && this.storeData.autoDeduction ? 'display:inline-block' : 'display: none'}>
            &nbsp;|&nbsp;{app.translator.trans('mattoid-store.lib.item-invalid', { day: this.storeData.outtime })}
          </span>
        </div>
        <div className="spacing">
          <div id="box">{this.storeData.desc}</div>
        </div>
        <div className="spacing center">
          <img
            id="logo-img"
            className="icon-size"
            src={this.storeData.icon}
            style={this.storeData.icon && this.storeData.icon.slice(-5) === '.webm' ? 'display: none' : ''}
          />
          <video
            id="logo-video"
            autoplay
            loop
            muted
            playsinline
            className="icon-size"
            poster="https://invites.fun/assets/mattoid/store/1726117989_u9m3xRVtpxBiWYMn.png"
            style={this.storeData.icon && this.storeData.icon.slice(-5) === '.webm' ? '' : 'display: none'}
          >
            <source src={this.storeData.icon} type="video/webm" />
          </video>
        </div>
      </div>
    );
  }

  showDetails(storeData: StoreItemData) {
    if (app.session.user) {
      app.modal.show(StoreBox, { storeData });
    }
  }
}
