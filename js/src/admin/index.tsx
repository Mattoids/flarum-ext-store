import app from 'flarum/admin/app';
import StoreListPage from './components/StoreListPage';
import initStoreAdminRegistry from './storeAdminRegistry';

app.initializers.add('mattoid-store', () => {
  initStoreAdminRegistry();

  app.extensionData
    .for('mattoid-store')
    .registerPage(StoreListPage)
    .registerPermission(
      {
        icon: 'fas fa-id-card',
        label: app.translator.trans('mattoid-store.admin.settings.group-view'),
        permission: 'mattoid-store.group-view',
        allowGuest: true,
      },
      'view'
    )
    .registerPermission(
      {
        icon: 'fas fa-id-card',
        label: app.translator.trans('mattoid-store.admin.settings.group-moderate'),
        permission: 'mattoid-store.group-moderate',
      },
      'moderate'
    );
});
