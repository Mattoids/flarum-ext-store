import app from 'flarum/forum/app';
import Component from "flarum/Component";
import StoreBox from "./StoreBox";

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
    const discountPrice = moneyName.replace('[money]', this.storeData.discountPrice);

    return (
      <div id={this.storeData.id} onclick={() => this.showDetails(this.storeData)}>
        <div className="itemTitle">
          {this.storeData.title}
        </div>
        <div className="price spacing">
          {this.storeData.discountPrice > 0 ?
            (
              <div>
                <span className="price">{discountPrice}</span>&nbsp;
                <span className="discount">{price}</span>
              </div>
            ) :
            (<span className="price">{price}</span>)}
        </div>
        <div className="spacing">
          {app.translator.trans('mattoid-store.lib.item-stock')}: {this.storeData.stock == -99 ? '无限' : this.storeData.stock } | {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)}
        </div>
        <div className="spacing">
          <div id="box"></div>
          {this.storeData.desc}
        </div>
        <div className="spacing center">
          <img className="icon-size" src={this.storeData.icon}/>
        </div>
      </div>
    )
  }

  showDetails(storeData) {
    if(app.session.user){
      app.modal.show(StoreBox, {storeData});
    }
  }
}
