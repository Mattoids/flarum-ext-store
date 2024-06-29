import Modal, {IInternalModalAttrs} from "flarum/common/components/Modal";
import type Mithril from "mithril";
import Stream from "flarum/common/utils/Stream";
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Select from "flarum/common/components/Select";
import TextEditor from 'flarum/common/components/TextEditor'

interface IStoreModalAttrs extends IInternalModalAttrs {
  storeData: object
}

export default class StoreBox extends Modal<IStoreModalAttrs> {
  private storeData: object = {}
  private params: object = {}
  private range: boolean = false

  static initAttrs(attrs: IStoreModalAttrs) {
    super.initAttrs(attrs);
  }

  oninit(vnode: Mithril.Vnode<IStoreModalAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.storeData;
    this.params.id = this.attrs.storeData.id;
  }

  title() {
    return this.storeData.title;
  }

  className(): string {
    return this.storeData.className;
  }

  content() {
    return m('.Modal-body', [
      this.getHtml(JSON.parse(this.storeData.popUp)),
      m('.Form-group .center', [
        Button.component({
          type: 'submit',
          className: 'Button Button--primary',
          loading: this.loading,
          // disabled: parseFloat(this.amount || '0') <= 0,
        }, app.translator.trans('mattoid-store.forum.button'))
      ])
    ])
  }

  getHtml(popUp) {
    return popUp.map((item) => {
      return this.getInput(item);
    })
  }

  getInput(column) {
    let input;

    switch (column.prop) {
      case 'input':
        input = (
          m('.Form-group', [
            m('label', app.translator.trans(column.label)),
            m('.helpText', app.translator.trans(column.helpText)),
            m('input.FormControl', {
              type: column.type || 'text',
              value: this.params[column.value],
              onchange: (event: InputEvent) => {
                this.params[column.value] = (event.target as HTMLInputElement).value;
              },
              min: 0,
              step: 0.1,
              disabled: this.loading,
            })
          ])
        )
        break;
      case 'switch':
        input = (
          m('.Form-group', [
            Switch.component({
              state: this.range,
              onchange: (value: boolean) => {
                this.range = value;
                this.params[column.value] = value
              },
              disabled: this.loading,
            }, app.translator.trans(column.label)),
            m('.helpText', app.translator.trans(column.helpText))
          ])
        )
        break;
      case 'select':
        input = (
          m('.Form-group', [
            m('label', app.translator.trans(column.label)),
            m('.helpText', app.translator.trans(column.helpText)),
            Select.component({
              value: this.params[column.value],
              disabled: this.loading,
              options: column.options,
              buttonClassName: "Button",
              onchange: (val) => {
                this.params[column.value] = val
              }
            })
          ])
        )
        break;
      case 'textarea':
        input = (
          m('.Form-group', [
            m('label', app.translator.trans(column.label)),
            m('.helpText', app.translator.trans(column.helpText)),
            <textarea className="FormControl" value={this.params[column.value]}>{this.params[column.value]}</textarea>
      ])
      )
        break
    }

    return input;
  }

  onsubmit(event: Event) {
    event.preventDefault();
    this.loading = true;

    app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/store/buy/goods',
      body: this.params
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        // this.handleErrors(result);
      });
  }
}
