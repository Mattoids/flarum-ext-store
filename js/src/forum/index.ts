import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import UserPage from 'flarum/forum/components/UserPage';
import StorePage from './components/pages/StorePage';
import MyCartPage from './components/pages/MyCartPage';
import BackpackPage from './components/pages/BackpackPage';
import initStoreRegistry from './storeRegistry';

app.initializers.add('mattoid/store', () => {
  initStoreRegistry();

  app.routes.store = {
    path: '/store',
    component: StorePage,
  };
  app.routes.myCartPage = {
    path: '/u/:username/cart',
    component: MyCartPage,
  };
  app.routes.backpack = {
    path: '/u/:username/backpack',
    component: BackpackPage,
  };

  extend(UserPage.prototype, 'navItems', function (items) {
    if (!app.session || !app.session.user || !app.session.user.attribute('canStoreView')) {
      return false;
    }

    items.add(
      'myCartPage',
      LinkButton.component(
        {
          href: app.route('myCartPage', {
            username: this.user.slug(),
          }),
          icon: 'fas fa-shopping-cart',
        },
        app.translator.trans('mattoid-store.forum.cart')
      ),
      15
    );
  });

  extend(UserPage.prototype, 'navItems', function (items) {
    if (!app.session || !app.session.user || this.user.id() !== app.session.user.id()) {
      return false;
    }

    items.add(
      'backpack',
      LinkButton.component(
        {
          href: app.route('backpack', {
            username: this.user.slug(),
          }),
          icon: 'fas fa-box',
        },
        app.translator.trans('mattoid-store.forum.backpack')
      ),
      10
    );
  });

  extend(IndexPage.prototype, 'navItems', function (items) {
    if (!app.session || !app.session.user || !app.session.user.attribute('canStoreView')) {
      return false;
    }

    items.add(
      'store',
      LinkButton.component(
        {
          href: app.route('store'),
          icon: 'fas fa-store',
        },
        app.forum.attribute('storeName') || app.translator.trans('mattoid-store.forum.tital')
      )
    );
  });
});
