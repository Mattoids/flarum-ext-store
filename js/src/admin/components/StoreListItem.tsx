import app from 'flarum/admin/app';
import Component, { ComponentAttrs } from 'flarum/common/Component';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import StoreModal from './StoreModal';
import StoreGoodsDetailModal from './StoreGoodsDetailModal';
import GiftGoodsModal from './GiftGoodsModal';

interface StoreListItemAttrs extends ComponentAttrs {
  item: StoreApiResource;
  /** 数据变化回调（编辑保存/删除后父组件刷新或移除该行） */
  onChanged?: () => void;
}

export default class StoreListItem extends Component<StoreListItemAttrs> {
  private storeData: StoreItemData = {} as StoreItemData;

  oninit(vnode: Mithril.Vnode<StoreListItemAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.item.attributes;
  }

  view(): Mithril.Children {
    // 商品插件可注册自定义管理端列表行，未注册时使用默认展示
    const CustomItem = (app as any).storeAdminRegistry?.listItem?.get(this.attrs.item.attributes.code);
    if (CustomItem) {
      return <CustomItem item={this.attrs.item} />;
    }

    const data = this.storeData;
    const icon = data.icon || data.pluginIcon;
    const extIcon = data.pluginExtIcon;
    const moneyName = String(app.forum.attribute('antoinefr-money.moneyname') || '[money]');
    const price = data.price > 0 ? moneyName.replace('[money]', String(data.price)) : app.translator.trans('mattoid-store.lib.free');
    const isVideo = icon && icon.slice(-5) === '.webm';
    // CSS 类名 icon（如用户名颜色 decorationStoreColorText2）不能作为图片地址
    const isClassIcon = icon && icon.indexOf('/') === -1 && icon.indexOf('.') === -1;
    const statusUp = Number(data.status) === 1;

    return (
      <div id={'goods' + data.id} className="StoreAdminItem">
        <div className="StoreAdminItem-icon">
          {icon ? (
            isClassIcon ? (
              <span className={'StoreIconClassPreview ' + icon}>{app.translator.trans('mattoid-store.lib.class-icon-preview')}</span>
            ) : isVideo ? (
              <video autoplay loop muted playsinline>
                <source src={icon} type="video/webm" />
              </video>
            ) : (
              <img src={icon} alt={data.title || ''} />
            )
          ) : extIcon ? (
            <span
              className="StoreAdminItem-extIcon"
              style={{
                backgroundColor: extIcon.backgroundColor,
                color: extIcon.color,
                backgroundImage: extIcon.backgroundImage,
              }}
            >
              <i className={extIcon.name} />
            </span>
          ) : (
            <i className="fas fa-box StoreAdminItem-iconPlaceholder" />
          )}
        </div>

        <div className="StoreAdminItem-main">
          <div className="StoreAdminItem-head">
            <span className="StoreAdminItem-title">{data.title}</span>
            <span className={'StoreBadge StoreBadge--' + (statusUp ? 'success' : 'muted')}>
              {app.translator.trans('mattoid-store.lib.item-status-' + data.status)}
            </span>
          </div>
          {data.desc && <div className="StoreAdminItem-desc">{data.desc}</div>}
          <div className="StoreAdminItem-meta">
            <span>
              {app.translator.trans('mattoid-store.lib.item-price')}: <b>{price}</b>
            </span>
            <span>
              {app.translator.trans('mattoid-store.lib.item-stock')}:{' '}
              <b>{data.stock == -99 ? app.translator.trans('mattoid-store.lib.infinite') : data.stock}</b>
            </span>
            {Number(data.discount) > 0 && (
              <span>
                {app.translator.trans('mattoid-store.lib.item-discount')}: <b>{data.discount}%</b>
              </span>
            )}
            <span>{app.translator.trans('mattoid-store.lib.item-type-' + data.type)}</span>
            <span>{app.translator.trans('mattoid-store.lib.item-use-type-' + (data.useType || 'permanent'))}</span>
            {data.subtype && <span>{data.subtype}</span>}
            {data.group && (
              <span>
                {app.translator.trans('mattoid-store.lib.filter-group')}: {data.group}
              </span>
            )}
            <span>
              {app.translator.trans('mattoid-store.lib.item-created-at')}: {data.createdAt}
            </span>
          </div>
        </div>

        <div className="StoreAdminItem-actions">
          <Button className="Button" onclick={() => app.modal.show(StoreGoodsDetailModal, { storeData: data, onSaved: this.attrs.onChanged })}>
            {app.translator.trans('mattoid-store.admin.settings.goods-edit')}
          </Button>
          <Button className="Button" onclick={() => app.modal.show(GiftGoodsModal, { storeData: data })}>
            {app.translator.trans('mattoid-store.admin.settings.gift-goods')}
          </Button>
          <Button
            className={statusUp ? 'Button Button--danger' : 'Button StoreAdminItem-statusUp'}
            onclick={() => app.modal.show(StoreModal, { storeData: data, title: 'status-' + data.status })}
          >
            {statusUp ? app.translator.trans('mattoid-store.lib.item-status-down') : app.translator.trans('mattoid-store.lib.item-status-up')}
          </Button>
          <Button
            className="Button Button--danger"
            onclick={() => app.modal.show(StoreModal, { storeData: data, title: 'delete', onSuccess: this.attrs.onChanged })}
          >
            {app.translator.trans('mattoid-store.admin.settings.goods-delete')}
          </Button>
        </div>
      </div>
    );
  }
}
