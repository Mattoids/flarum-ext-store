import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import UserPage from 'flarum/forum/components/UserPage';
import StorePage from './components/pages/StorePage';
import MyCartPage from './components/pages/MyCartPage';
import ItemList from 'flarum/common/utils/ItemList';

app.initializers.add('mattoid/store', () => {
  app.routes.store = {
    path: '/store',
    component: StorePage,
  };
  app.routes.myCartPage = {
    path: '/u/:username/cart',
    component: MyCartPage,
  };

  extend(UserPage.prototype, 'navItems', function (this: UserPage, items: ItemList<Mithril.Children>) {
    const user = this.user;
    if (!app.session?.user || !app.session.user.attribute('canStoreView') || !user) {
      return;
    }

    items.add(
      'myCartPage',
      LinkButton.component(
        {
          href: app.route('myCartPage', {
            username: user.slug(),
          }),
          icon: 'fas fa-shopping-cart',
        },
        app.translator.trans('mattoid-store.forum.cart')
      )
    );
  });

  extend(IndexPage.prototype, 'navItems', function (items: ItemList<any>) {
    if (!app.session || !app.session.user || !app.session.user.attribute('canStoreView')) {
      return;
    }

    items.add(
      'store',
      LinkButton.component(
        {
          href: app.route('store'),
          icon: 'fas fa-store',
        },
        // V-14: 优先使用 storeName 设置，回退到 title（保留 tital 作为旧 key 别名）
        // V-14: prefer storeName setting, fallback to title (tital remains as alias)
        app.forum.attribute('storeName') || app.translator.trans('mattoid-store.forum.title')
      )
    );
  });
});
