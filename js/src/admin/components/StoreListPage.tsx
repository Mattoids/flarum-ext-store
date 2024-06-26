import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import type Mithril from 'mithril';
import AddStoreCommodity from "./AddStoreCommodity";

export default class StoreListPage extends ExtensionPage {
  oninit(vnode: Mithril.Vnode) {
    super.oninit(vnode);
  }

  content() {
    return (
      <div className="ExtensionPage-body">
        <div className="ExtensionPage-settings FlarumBadgesPage">
          <div className="container">
            <form>
              {this.buildSettingComponent({
                type: 'string',
                setting: 'mattoid-store.storeName',
                label: app.translator.trans('mattoid-store.admin.settings.store-name'),
                placeholder: app.translator.trans('mattoid-store.admin.settings.store-name'),
                help: app.translator.trans('mattoid-store.admin.settings.store-name-requirement'),
              })}
              {this.buildSettingComponent({
                type: 'string',
                setting: 'mattoid-store.decorationStoreTimezone',
                label: app.translator.trans('mattoid-store.admin.settings.decorationStoreTimezone'),
                placeholder: 'Asia/Shanghai',
                help: app.translator.trans('mattoid-store.admin.settings.decorationStoreTimezone-requirement'),
              })}
              {this.submitButton()}
            </form>
            <hr/>
            {this.buildSettingComponent(function () {
                return m('.Form-group', Button.component({
                  className: 'Button',
                  onclick() {
                    app.modal.show(AddStoreCommodity);
                  },
                }, app.translator.trans('mattoid-store.admin.settings.add-store-commodity')));
            })}
          </div>
        </div>
      </div>
    )
  }
}
