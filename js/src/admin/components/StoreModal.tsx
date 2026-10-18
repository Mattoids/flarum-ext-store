import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class StoreModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.type = this.attrs.title;
    this.storeData = this.attrs.storeData;
  }

  className() {
    return 'Modal--small StoreConfirmModal';
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.goods-item-' + this.type);
  }

  content() {
    const isDelete = this.type === 'delete';
    const icon = this.storeData.icon || this.storeData.pluginIcon;
    const extIcon = this.storeData.pluginExtIcon;
    const isVideo = icon && icon.slice(-5) === '.webm';
    // CSS 类名 icon（如用户名颜色 decorationStoreColorText2）不能作为图片地址
    const isClassIcon = icon && icon.indexOf('/') === -1 && icon.indexOf('.') === -1;

    return (
      <div className="Modal-body">
        <div className="StoreConfirmBody">
          <div className={'StoreConfirmIcon' + (isDelete ? ' StoreConfirmIcon--danger' : '')}>
            {icon ? (
              isClassIcon ? (
                <span className={'StoreIconClassPreview ' + icon}>
                  {app.translator.trans('mattoid-store-decoration.lib.item-property-style-text-effect')}
                </span>
              ) : isVideo ? (
                <video autoplay loop muted playsinline>
                  <source src={icon} type="video/webm" />
                </video>
              ) : (
                <img src={icon} />
              )
            ) : extIcon && (extIcon.name || extIcon.backgroundImage) ? (
              <span
                className="StoreAdminItem-extIcon"
                style={{
                  backgroundColor: extIcon.backgroundColor,
                  color: extIcon.color,
                  backgroundImage: extIcon.backgroundImage,
                }}
              >
                {extIcon.name ? <i className={extIcon.name} /> : ''}
              </span>
            ) : (
              <i className={'fas ' + (isDelete ? 'fa-trash-alt' : 'fa-exchange-alt')} />
            )}
          </div>
          <div className="StoreConfirmText">
            <div className="StoreConfirmTitle">{this.storeData.title}</div>
            <div className="StoreConfirmDesc">{app.translator.trans('mattoid-store.admin.settings.goods-item-' + this.type)}</div>
          </div>
        </div>
        <div className="StoreConfirmActions">
          {Button.component(
            {
              className: 'Button ' + (isDelete ? 'Button--danger' : 'Button--primary'),
              type: 'submit',
              loading: this.loading,
            },
            app.translator.trans('mattoid-store.lib.confirm')
          )}
          {Button.component(
            {
              className: 'Button storeButton--gray',
              loading: this.loading,
              onclick: () => {
                this.hide();
              },
            },
            app.translator.trans('mattoid-store.lib.cancel')
          )}
        </div>
      </div>
    );
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;

    const status = this.storeData.status;
    this.storeData.status = Number(!this.storeData.status);

    const method = this.type === 'delete' ? 'DELETE' : 'PUT';
    app
      .request({
        method: method,
        url: app.forum.attribute('apiUrl') + '/store/goods',
        body: this.storeData,
      })
      .then(
        () => location.reload(),
        (error) => {
          this.loading = false;
          this.storeData.status = status;
          this.onerror(error);
        }
      );
  }
}
