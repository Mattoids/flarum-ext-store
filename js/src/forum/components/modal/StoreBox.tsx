import app from 'flarum/forum/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import Switch from 'flarum/common/components/Switch';
import Select from 'flarum/common/components/Select';
import { formatMoney } from '../../../common/money';

export interface IStoreModalAttrs extends IInternalModalAttrs {
  storeData: StoreItemData;
  onSuccess?: (storeData: StoreItemData) => void;
}

export default class StoreBox extends Modal<IStoreModalAttrs> {
  private storeData: StoreItemData = {} as StoreItemData;
  private params: Record<string, any> = {};
  private popUpFields: StoreBoxField[] = [];
  private errorText: any = '';

  oninit(vnode: Mithril.Vnode<IStoreModalAttrs, this>) {
    super.oninit(vnode);

    this.storeData = this.attrs.storeData;
    this.params.id = this.attrs.storeData.id;

    try {
      const parsed = JSON.parse(this.storeData.popUp || '[]');
      this.popUpFields = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      this.errorText = app.translator.trans('mattoid-store.forum.error.validate-fail');
    }
  }

  title(): Mithril.Children {
    return this.storeData.title;
  }

  className(): string {
    return this.storeData.className || '';
  }

  content(): Mithril.Children {
    const canBuy = app.session.user && app.session.user.attribute('canStoreView');
    return m('.Modal-body.StoreBox-body', [
      this.renderSummary(),
      this.errorText ? m('.Alert.Alert--error', this.errorText) : null,
      m('.StoreBox-form', this.getHtml(this.popUpFields)),
      m('.StoreBox-submit', [
        Button.component(
          {
            type: 'submit',
            className: 'Button Button--primary Button--block',
            loading: this.loading,
            disabled: !canBuy,
          },
          canBuy ? app.translator.trans('mattoid-store.forum.button') : app.translator.trans('mattoid-store.forum.no-permission-buy')
        ),
      ]),
    ]);
  }

  renderSummary() {
    const d = this.storeData;
    if (!d || !d.id) return null;

    const price = d.price > 0 ? formatMoney(d.price) : app.translator.trans('mattoid-store.forum.free');
    const discountPrice = formatMoney(d.discountPrice);
    const isVideo = d.icon && d.icon.slice(-5) === '.webm';
    const stockText = d.stock == -99 ? app.translator.trans('mattoid-store.forum.infinite') : d.stock;
    const typeText =
      app.translator.trans('mattoid-store.lib.item-type-' + d.type) +
      (d.type === 'limit' ? ` (${d.outtime}${app.translator.trans('mattoid-store.forum.days')})` : '');

    return m('.StoreBox-summary', [
      d.icon
        ? m(
            '.StoreBox-summaryIcon',
            isVideo
              ? m('video', { autoplay: true, loop: true, muted: true, playsinline: true }, m('source', { src: d.icon, type: 'video/webm' }))
              : m('img', { src: d.icon })
          )
        : null,
      m('.StoreBox-summaryInfo', [
        m('.StoreBox-priceGroup', [
          m('span.price', (d.discountPrice || 0) > 0 ? discountPrice : price),
          (d.discountPrice || 0) > 0 ? m('span.discount', price) : null,
        ]),
        m('.StoreBox-meta', [
          m('span.StoreBox-metaItem', app.translator.trans('mattoid-store.lib.item-stock') + ': ' + stockText),
          m('span.StoreBox-metaItem', typeText),
        ]),
      ]),
    ]);
  }

  getHtml(popUp: StoreBoxField[]) {
    return popUp.map((item: StoreBoxField) => {
      return this.getInput(item);
    });
  }

  getInput(column: StoreBoxField) {
    let input;

    switch (column.prop) {
      case 'input':
        input = m('.Form-group', [
          m('label', app.translator.trans(column.label || '')),
          m('.helpText', app.translator.trans(column.helpText || '')),
          m('input.FormControl', {
            type: column.type || 'text',
            value: this.params[column.value],
            onchange: (event: InputEvent) => {
              this.params[column.value] = (event.target as HTMLInputElement).value;
            },
            min: 0,
            step: 0.1,
            disabled: this.loading,
          }),
        ]);
        break;
      case 'switch':
        input = m('.Form-group', [
          Switch.component(
            {
              // 以 params 为唯一状态源，多 switch 字段互不覆盖，也天然回填初始值
              state: !!this.params[column.value],
              onchange: (value: boolean) => {
                this.params[column.value] = value;
              },
              disabled: this.loading,
            },
            app.translator.trans(column.label || '')
          ),
          m('.helpText', app.translator.trans(column.helpText || '')),
        ]);
        break;
      case 'select':
        input = m('.Form-group', [
          m('label', app.translator.trans(column.label || '')),
          m('.helpText', app.translator.trans(column.helpText || '')),
          Select.component({
            value: this.params[column.value],
            disabled: this.loading,
            options: column.options,
            buttonClassName: 'Button',
            onchange: (val: string) => {
              this.params[column.value] = val;
            },
          }),
        ]);
        break;
      case 'textarea':
        input = m('.Form-group', [
          m('label', app.translator.trans(column.label || '')),
          m('.helpText', app.translator.trans(column.helpText || '')),
          m('textarea.FormControl', {
            value: this.params[column.value],
            disabled: this.loading,
            onchange: (event: InputEvent) => {
              this.params[column.value] = (event.target as HTMLInputElement).value;
            },
          }),
        ]);
        break;
    }

    return input;
  }

  onsubmit(event: Event) {
    event.preventDefault();
    if (!app.session.user || !app.session.user.attribute('canStoreView')) {
      return;
    }
    this.loading = true;
    this.errorText = '';

    app
      .request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/store/buy/goods',
        body: this.params,
      })
      .then(
        () => {
          // 重新拉取用户数据以更新余额（后端按折扣窗口实付，前端不本地推算）
          const user = app.session.user;
          if (user) {
            app.store.find('users', user.id()).catch(() => {});
          }
          if (this.attrs.onSuccess) {
            this.attrs.onSuccess(this.storeData);
          }
          app.alerts.show({ type: 'success' }, app.translator.trans('mattoid-store.forum.error.buy-success'));
          this.hide();
        },
        (result: any) => {
          this.loading = false;
          this.errorText = result?.response?.responseJSON?.errors?.[0]?.detail || app.translator.trans('mattoid-store.forum.error.validate-fail');
        }
      );
  }
}
