import app from 'flarum/forum/app';
import Component from "flarum/Component";
import StoreBox from "../modal/StoreBox";

export default class StoreItem extends Component {
  private storeData: object = {}

  private descTimer: any = null
  private showDescTip: boolean = false

  oninit(vnode) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes
    this.storeData.id = this.attrs.item.id
  }

  onremove() {
    this.clearDescTimer();
  }

  view() {
    // 商品插件可注册自定义商品卡片，未注册时使用默认展示
    const CustomItem = (app as any).storeRegistry?.item?.get(this.attrs.item.attributes.code);
    if (CustomItem) {
      return <CustomItem item={this.attrs.item} onSuccess={this.attrs.onSuccess} />;
    }

    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = this.storeData.price > 0 ? moneyName.replace('[money]', this.storeData.price) : app.translator.trans('mattoid-store.forum.free');
    const discountPrice = moneyName.replace('[money]', this.storeData.discountPrice);
    const isVideo = this.storeData.icon && this.storeData.icon.slice(-5) === '.webm';

    return (
      <div id={"goods" + this.storeData.id} className="StoreItem" onclick={() => this.showDetails(this.storeData)}>
        <div className="itemTitle">
          {this.storeData.title}
        </div>
        <div className="StoreItem-icon">
          <img className="logo-img" src={this.storeData.icon} style={isVideo ? 'display: none' : ''}/>
          <video className="logo-video" autoplay loop muted playsinline style={isVideo ? '' : 'display: none'}>
            <source src={this.storeData.icon} type="video/webm"/>
          </video>
        </div>
        <div className="StoreItem-descWrap" onmouseenter={() => this.onDescEnter()} onmouseleave={() => this.onDescLeave()}>
          <div className="StoreItem-desc">
            {this.storeData.desc}
          </div>
          {this.showDescTip && this.storeData.desc ? (
            <div className="StoreItem-descTip">
              {this.storeData.desc}
            </div>
          ) : null}
        </div>
        <div className="StoreItem-footer">
          <div className="StoreItem-priceGroup">
            {this.storeData.discountPrice > 0 && <span className="discount">{price}</span>}
            <span className="price">
              {this.storeData.discountPrice > 0 ? discountPrice : price}
            </span>
          </div>
          <div className="StoreItem-side">
            <span className="StoreItem-stock">
              {app.translator.trans('mattoid-store.lib.item-stock')}: {this.storeData.stock == -99 ? app.translator.trans('mattoid-store.forum.infinite') : this.storeData.stock}
            </span>
            <span className="StoreItem-type">
              {app.translator.trans('mattoid-store.lib.item-type-' + this.storeData.type)}
              {this.storeData.type === 'limit' ? ` (${this.storeData.outtime}${app.translator.trans('mattoid-store.forum.days')})` : ''}
            </span>
          </div>
        </div>
      </div>
    )
  }

  showDetails(storeData) {
    if (app.session.user) {
      // 商品插件可注册自定义购买/价格弹窗或详情页，未注册时使用默认 StoreBox
      const registry = (app as any).storeRegistry;
      const CustomModal = registry?.priceModal?.get(storeData.code) || registry?.detail?.get(storeData.code);
      app.modal.show(CustomModal || StoreBox, {storeData, onSuccess: this.attrs.onSuccess});
    }
  }

  /**
   * 鼠标移入商品描述区域：1 秒后浮层展示完整描述
   */
  onDescEnter() {
    this.clearDescTimer();
    this.descTimer = setTimeout(() => {
      this.showDescTip = true;
      m.redraw();
    }, 1000);
  }

  /**
   * 鼠标移出商品描述区域：立即隐藏浮层并取消计时
   */
  onDescLeave() {
    this.clearDescTimer();
    if (this.showDescTip) {
      this.showDescTip = false;
      m.redraw();
    }
  }

  clearDescTimer() {
    if (this.descTimer) {
      clearTimeout(this.descTimer);
      this.descTimer = null;
    }
  }
}
