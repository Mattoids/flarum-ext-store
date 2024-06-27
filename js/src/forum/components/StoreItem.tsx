import app from 'flarum/forum/app';
import Component from "flarum/Component";

export default class StoreItem extends Component {
  private storeData: object = {}

  oninit(vnode) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes
    this.storeData.id = this.attrs.item.id
  }

  view() {
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = moneyName.replace('[money]', this.storeData.price);

    return (
      <div id={this.storeData.id}>
        <div className="itemTitle">
          {this.storeData.title}
        </div>
        <div className="price spacing">
          {price}
        </div>
        <div className="spacing">
          {app.translator.trans('mattoid-store.lib.item-stock')}: {this.storeData.stock} | {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)}
        </div>
        <div className="spacing">
          {this.storeData.desc}
        </div>
        <div className="spacing center">
          <img className="icon-size" src={this.storeData.icon}/>
        </div>
      </div>
    )
  }
}
