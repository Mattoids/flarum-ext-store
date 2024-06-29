import app from 'flarum/admin/app';
import StoreListPage from './components/StoreListPage';
import StorePage from "./components/StorePage";

app.initializers.add('mattoid-store', () => {
  app.extensionData.for("mattoid-store")
    // .registerSetting({
    //   setting: 'mattoid-store.storeName',
    //   help: app.translator.trans('mattoid-store.admin.settings.store-name-requirement'),
    //   label: app.translator.trans('mattoid-store.admin.settings.store-name'),
    //   type: 'string',
    // })
    // .registerSetting({
    //   setting: 'mattoid-store.decorationStoreTimezone',
    //   help: app.translator.trans('mattoid-store.admin.settings.decorationStoreTimezone-requirement'),
    //   label: app.translator.trans('mattoid-store.admin.settings.decorationStoreTimezone'),
    //   type: 'string',
    // })
    .registerPage(StoreListPage)
    .registerPermission(
      {
        icon: 'fas fa-id-card',
        label: app.translator.trans('mattoid-store.admin.settings.group-view'),
        permission: 'mattoid-store.group-view',
        allowGuest: true
      }, 'view')
    .registerPermission(
      {
        icon: 'fas fa-id-card',
        label: app.translator.trans('mattoid-store.admin.settings.group-view'),
        permission: 'mattoid-store.group-moderate',
        allowGuest: true
      }, 'moderate')
});
