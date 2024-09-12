import app from 'flarum/forum/app';
import Component from "flarum/Component";
import StoreBox from "../modal/StoreBox";

export default class StoreItem extends Component {
  private storeData: object = {}

  oninit(vnode) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes
    this.storeData.id = this.attrs.item.id
  }

  view() {
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = this.storeData.price > 0 ? moneyName.replace('[money]', this.storeData.price) : app.translator.trans('mattoid-store.forum.free');
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
          {app.translator.trans('mattoid-store.lib.item-stock')}: {this.storeData.stock == -99 ? app.translator.trans('mattoid-store.forum.infinite') : this.storeData.stock }&nbsp;|&nbsp;
          {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)}&nbsp;
          <span style={this.storeData.type === 'limit' ? 'display:inline-block' : 'display: none'}>({this.storeData.outtime}{app.translator.trans('mattoid-store.forum.days')})</span>
          <span style={this.storeData.type === 'limit' && this.storeData.autoDeduction ? 'display:inline-block' : 'display: none'}>&nbsp;|&nbsp;{app.translator.trans('mattoid-store.lib.item-invalid', {'day' : this.storeData.outtime})}</span>
        </div>
        <div className="spacing">
          <div id="box">
            {this.storeData.desc}
          </div>
        </div>
        <div className="spacing center">
          <img className="icon-size" src={this.storeData.icon}
               style={this.storeData.icon && this.storeData.icon.slice(-5) === '.webm' ? 'display: none' : ''}/>
          <video autoplay loop muted playsinline className="icon-size"
                 style={this.storeData.icon && this.storeData.icon.slice(-5) === '.webm' ? '' : 'display: none'}>
            <source src={this.storeData.icon} type="video/webm"/>
          </video>
        </div>
      </div>
    )
  }

  showDetails(storeData) {
    if (app.session.user) {
      app.modal.show(StoreBox, {storeData});
    }
  }
}
