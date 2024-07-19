import app from 'flarum/forum/app';
import {extend} from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import UserPage from 'flarum/forum/components/UserPage';
import StorePage from "./components/pages/StorePage";
import MyCartPage from "./components/pages/MyCartPage";

app.initializers.add('mattoid/store', () => {
  app.routes.store = {
    path: '/store',
    component: StorePage,
  };
  app.routes.myCartPage = {
    path: '/u/:username/cart',
    component: MyCartPage,
  };

  extend(UserPage.prototype, 'navItems', function(items) {
    if (!app.session.user.attribute('canStoreView')) {
      return false;
    }

    items.add('myCartPage', LinkButton.component({
      href: app.route('myCartPage', {
        username: this.user.slug(),
      }),
      icon: 'fas fa-shop',
    }, app.translator.trans('mattoid-store.forum.cart')));
  });

  extend(IndexPage.prototype, 'navItems', function (items) {
    if (!app.session.user.attribute('canStoreView')) {
      return false;
    }

    items.add('store', LinkButton.component({
      href: app.route('store'),
      icon: 'fas fa-store',
    }, app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital')));
  });
});
