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
    return 'Modal--small';
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.commodity-item-' + this.type);
  }

  content() {
    //
    return (
      <div className="Modal-body">
        <div className="Form-group" style="text-align: center;">
          {Button.component(
            {
              className: 'Button Button--primary',
              type: 'submit',
              loading: this.loading,
            },
            app.translator.trans('mattoid-store.lib.confirm')
          )}&nbsp;
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
      url: app.forum.attribute('apiUrl') + '/store/commodity',
      body: this.storeData
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        this.storeData.status = status;
        this.handleErrors(result);
    });
  }
}
