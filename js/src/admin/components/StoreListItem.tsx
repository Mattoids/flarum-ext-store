import app from 'flarum/admin/app';
import Component from "flarum/Component";

export default class StoreListItem extends Component {
  private storeData: object = {}

  oninit(vnode) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes
    this.storeData.id = this.attrs.item.id
  }

  view() {
    return (
      <div id={this.storeData.id} className="storeItemContainer">
        <div className="leftAligned">
          <div>
            {app.translator.trans('mattoid-store.lib.item-id')}: {this.storeData.id} | &nbsp;
            {app.translator.trans('mattoid-store.lib.item-title')}: {this.storeData.title}
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-desc')}: {this.storeData.desc}
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-status')}: <span className={this.storeData.status === 0 ? 'red': 'green'}>{ app.translator.trans('mattoid-store.lib.item-status-' + this.storeData.status) }</span> |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-price')}: {this.storeData.price} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-stock')}: {this.storeData.stock} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-discount')}: {this.storeData.discount || '无'} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-discount_limit')}: {this.storeData.discountLimit || 0}&nbsp;{this.storeData.discountLimitUnit}
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-type')}: {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-created-at')}: {this.storeData.createdAt}
          </div>
        </div>
        <div className="rightAligned icon-size">
        <img src={this.storeData.icon}/>
        </div>
      </div>
    )
  }



}
