import app from 'flarum/forum/app';
import Component from "flarum/Component";
import Button from "flarum/common/components/Button";
import Alert from "flarum/common/components/Alert";

/**
 * 背包条目
 * Backpack item
 *
 * source=store   useType=permanent：[使用]/[取消使用]
 * source=store   useType=consumable：显示剩余件数，[使用] 消耗一件
 * source=decoration：[佩戴]/[卸下]（直调装饰店原 API，保留其功能）
 *
 * 商品插件可通过 app.storeRegistry.backpackPanel.register(code, Panel)
 * 自定义背包中该商品的状态面板（props: item）。
 */
export default class BackpackItem extends Component {

  private item: any = {};
  private loading: boolean = false;

  oninit(vnode) {
    super.oninit(vnode);
    this.item = this.attrs.item.attributes || {};
  }

  view() {
    const item = this.item;

    // 商品插件可整体替换背包条目（props: item / onChanged）
    const CustomItem = (app as any).storeRegistry?.backpackItem?.get(item.code);
    if (CustomItem) {
      return <CustomItem item={item} onChanged={this.attrs.onChanged} />;
    }

    const Panel = (app as any).storeRegistry?.backpackPanel?.get(item.code);
    const icon = item.source === 'decoration' ? item.itemPropertyImage : item.icon;
    const isVideo = icon && icon.slice(-5) === '.webm';

    return (
      <div className="frame BackpackItem">
        <div className="row margin-top-10">
          <div className="col-md-2 BackpackItem-icon">
            {icon ? (
              isVideo
                ? <video autoplay loop muted playsinline><source src={icon} type="video/webm"/></video>
                : <img src={icon}/>
            ) : (
              <span className="BackpackItem-iconPlaceholder"><i className="fas fa-box"/></span>
            )}
          </div>
          <div className="col-md-8">
            <div>
              <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-title')}: </label>
              <span className="color-green" style="cursor: pointer;" onclick={() => this.showDetail(item)}>{item.title}</span>
            </div>
            {this.renderSourceDetail(item)}
            {Panel && <Panel item={item} />}
          </div>
          <div className="col-md-2 BackpackItem-actions">
            {this.renderActions(item)}
          </div>
        </div>
      </div>
    );
  }

  renderSourceDetail(item) {
    if (item.source === 'store') {
      return (
        <div>
          <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-cart-type')}: </label>
          <span>{app.translator.trans('mattoid-store.lib.item-type-' + (item.type || 'permanent'))}</span> &nbsp;|&nbsp;
          <label className="Cart-Label">{app.translator.trans('mattoid-store.lib.item-use-type-' + (item.useType || 'permanent'))}</label>
          {item.useType === 'consumable' && (
            <span> &nbsp;|&nbsp; {app.translator.trans('mattoid-store.lib.backpack-remaining', {count: item.remaining})}</span>
          )}
          {item.useType === 'permanent' && item.enable ? (
            <span className="color-green"> &nbsp;|&nbsp; {app.translator.trans('mattoid-store.lib.backpack-in-use')}</span>
          ) : ''}
        </div>
      );
    }

    // decoration
    return (
      <div>
        <span>{app.translator.trans('mattoid-store.lib.backpack-remaining', {count: item.itemCount})}</span>
        {item.itemStatus ? (
          <span className="color-green"> &nbsp;|&nbsp; {app.translator.trans('mattoid-store.lib.backpack-in-use')}</span>
        ) : ''}
      </div>
    );
  }

  renderActions(item) {
    if (item.source === 'store') {
      const label = item.useType === 'consumable'
        ? app.translator.trans('mattoid-store.lib.backpack-use')
        : item.enable
          ? app.translator.trans('mattoid-store.lib.backpack-cancel-use')
          : app.translator.trans('mattoid-store.lib.backpack-use');

      return (
        <Button className={'Button Button--primary'} disabled={this.loading} loading={this.loading}
                onclick={() => this.useStoreItem(item)}>
          {label}
        </Button>
      );
    }

    // decoration：佩戴/卸下，走装饰店原接口
    const equip = !item.itemStatus;
    return (
      <Button className={'Button Button--primary'} disabled={this.loading} loading={this.loading}
              onclick={() => this.toggleDecoration(item, equip)}>
        {equip ? app.translator.trans('mattoid-store.lib.backpack-equip') : app.translator.trans('mattoid-store.lib.backpack-unequip')}
      </Button>
    );
  }

  /**
   * 点击商品标题：插件注册了 backpackDetail 则弹自定义详情，否则无操作
   */
  showDetail(item) {
    const Detail = (app as any).storeRegistry?.backpackDetail?.get(item.code);
    if (Detail) {
      app.modal.show(Detail, {item});
    }
  }

  /**
   * 使用/取消使用成功后：插件注册了 backpackUseModal 则弹结果弹窗
   */
  showUseResult(item, result) {
    const UseModal = (app as any).storeRegistry?.backpackUseModal?.get(item.code);
    if (UseModal) {
      app.modal.show(UseModal, {item, result});
    }
  }

  useStoreItem(item) {
    this.loading = true;
    m.redraw();

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/store/backpack/use',
      body: {id: item.refId},
    }).then(
      (result) => {
        this.loading = false;
        this.showUseResult(item, result);
        if (this.attrs.onChanged) this.attrs.onChanged();
      },
      (error) => {
        this.loading = false;
        this.showError(error);
      });
  }

  toggleDecoration(item, equip) {
    this.loading = true;
    m.redraw();

    app.request({
      method: 'PATCH',
      url: app.forum.attribute('apiUrl') + '/decorationStoreEquipment/' + item.refId,
      body: {data: {attributes: {purchaseID: item.refId, purchaseStatus: equip ? 1 : 0}}},
    }).then(
      () => {
        this.loading = false;
        if (this.attrs.onChanged) this.attrs.onChanged();
      },
      (error) => {
        this.loading = false;
        this.showError(error);
      });
  }

  showError(error) {
    const detail = error && error.response && error.response.responseJSON
      && error.response.responseJSON.errors && error.response.responseJSON.errors[0]
      ? error.response.responseJSON.errors[0].detail
      : null;
    app.alerts.show(Alert, {type: 'error'}, detail || app.translator.trans('mattoid-store.lib.backpack-use-fail'));
    m.redraw();
  }
}
