import app from 'flarum/admin/app';
import Component from "flarum/Component";
import Button from 'flarum/components/Button';
import StoreModal from "./StoreModal";
import StoreGoodsDetailModal from "./StoreGoodsDetailModal";

export default class StoreListItem extends Component {
  private storeData: object = {}

  oninit(vnode) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes
  }

  view() {
    const moneyName = app.forum.attribute('antoinefr-money.moneyname') || '[money]';
    const price = moneyName.replace('[money]', this.storeData.price);
    const data = this.storeData;

    const LimitUnit = {'days': '天', 'hour': '小时', 'minute': '分钟', 'second': '秒'};

    return (
      <div id={this.storeData.id} className="storeItemContainer">
        <div className="leftAligned">
          <div className="margin">
            <span>
              <Button className={'Button Button--primary'}
                onclick={() => {
                  app.modal.show(StoreGoodsDetailModal, {storeData: data});
                }}
              >
                {app.translator.trans('mattoid-store.admin.settings.goods-edit')}
              </Button>
            </span>
            <span className="margin">
              <Button className={'Button Button--danger'}
                onclick={() => {
                  app.modal.show(StoreModal, {storeData: data, title: 'delete'});
                }}
              >
                {app.translator.trans('mattoid-store.admin.settings.goods-delete')}
              </Button>
            </span>
            <span className="margin">
              <Button className={'Button'}
                onclick={() => {
                  app.modal.show(StoreModal, {storeData: data, title: 'status-' + this.storeData.status});
                }}
              >
                {this.storeData.status === 0 ? app.translator.trans('mattoid-store.lib.item-status-1') : app.translator.trans('mattoid-store.lib.item-status-0')}
              </Button>
            </span>
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-id')}: {this.storeData.id} | &nbsp;
            {app.translator.trans('mattoid-store.lib.item-title')}: {this.storeData.title}
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-desc')}: {this.storeData.desc}
          </div>
          <div>
            {app.translator.trans('mattoid-store.lib.item-status')}: <span className={this.storeData.status === 0 ? 'red': 'green'}>{ app.translator.trans('mattoid-store.lib.item-status-' + this.storeData.status) }</span> |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-price')}: {price} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-stock')}: { this.storeData.stock == -99 ? '无限' : this.storeData.stock } |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-discount')}: {this.storeData.discount ? this.storeData.discount + ' %' : '无'} |&nbsp;
            {app.translator.trans('mattoid-store.lib.item-discount_limit')}: {this.storeData.discountLimit || 0}&nbsp;{ LimitUnit[this.storeData.discountLimitUnit] }
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
