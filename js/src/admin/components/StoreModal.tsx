import app from 'flarum/admin/app';
import Modal from 'flarum/components/Modal';
import Button from 'flarum/components/Button';

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

    return (
      <div className="Modal-body">
        <div className="StoreConfirmBody">
          <div className={'StoreConfirmIcon' + (isDelete ? ' StoreConfirmIcon--danger' : '')}>
            <i className={'fas ' + (isDelete ? 'fa-trash-alt' : 'fa-exchange-alt')}/>
          </div>
          <div className="StoreConfirmText">
            <div className="StoreConfirmTitle">{this.storeData.title}</div>
            <div className="StoreConfirmDesc">
              {app.translator.trans('mattoid-store.admin.settings.goods-item-' + this.type)}
            </div>
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
              }
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
    this.storeData.status = Number(!this.storeData.status)

    const method = this.type === 'delete' ? 'DELETE' : 'PUT';
    app.request({
      method: method,
      url: app.forum.attribute('apiUrl') + '/store/goods',
      body: this.storeData
    }).then(
      () => location.reload(),
      (error) => {
        this.loading = false;
        this.storeData.status = status;
        this.onerror(error);
      });
  }
}
