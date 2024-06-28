import Modal, {IInternalModalAttrs} from "flarum/common/components/Modal";
import type Mithril from "mithril";
import Stream from "flarum/common/utils/Stream";
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';

interface IStoreModalAttrs extends IInternalModalAttrs {
  storeData: object
}

export default class StoreBox extends Modal<IStoreModalAttrs> {
  private storeData : object = {}

  static initAttrs(attrs: IStoreModalAttrs) {
    super.initAttrs(attrs);
  }

  oninit(vnode: Mithril.Vnode<IStoreModalAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.storeData;
  }

  title() {
    return this.storeData.title;
  }

  className(): string {
    return "";
  }

  content() {
    return this.getHtml()
  }

  getHtml() {
    return m('.Form-group', Button.component({
      type: 'submit',
      className: 'Button Button--primary',
      loading: this.loading,
      // disabled: parseFloat(this.amount || '0') <= 0,
    }, app.translator.trans('mattoid-store.forum.button')))
  }

  onsubmit(event: Event) {
    event.preventDefault();
    this.loading = true;

    console.log(app.forum.attribute('apiUrl') + this.storeData.uri)
    app.request({
      method: this.storeData.method,
      url: app.forum.attribute('apiUrl') + this.storeData.uri,
      body: this.storeData
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        // this.handleErrors(result);
      });
  }
}
