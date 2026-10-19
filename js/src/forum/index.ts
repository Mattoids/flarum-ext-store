import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import UserPage from 'flarum/forum/components/UserPage';
import StorePage from './components/pages/StorePage';
import MyCartPage from './components/pages/MyCartPage';
import BackpackPage from './components/pages/BackpackPage';
import initStoreRegistry from './storeRegistry';
import ItemList from 'flarum/common/utils/ItemList';
import UserControls from 'flarum/forum/utils/UserControls';
import Button from 'flarum/common/components/Button';
import ForumGiftGoodsModal from './components/modal/ForumGiftGoodsModal';

app.initializers.add('mattoid/store', () => {
  initStoreRegistry();

  // 用户主页「操作」菜单：有商店管理权限的用户可向该用户赠送商品
  extend(UserControls, 'moderationControls', function (items, user) {
    if (!app.session.user || !app.session.user.attribute('canStoreModerate')) {
      return;
    }

    items.add(
      'mattoid-store-gift-goods',
      m(Button, {
        icon: 'fas fa-gift',
        onclick: () => app.modal.show(ForumGiftGoodsModal, {user})
      }, app.translator.trans('mattoid-store.forum.gift-goods'))
    );
  });

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
      ),
      15
    );
  });

  extend(UserPage.prototype, 'navItems', function (this: UserPage, items: ItemList<Mithril.Children>) {
    const user = this.user;
    if (!app.session?.user || !user || user.id() !== app.session.user.id()) {
      return;
    }

    items.add(
      'backpack',
      LinkButton.component(
        {
          href: app.route('backpack', {
            username: user.slug(),
          }),
          icon: 'fas fa-box',
        },
        app.translator.trans('mattoid-store.forum.backpack')
      ),
      10
    );
  });

  extend(IndexPage.prototype, 'navItems', function (items: ItemList<Mithril.Children>) {
    if (!app.session?.user || !app.session.user.attribute('canStoreView')) {
      return;
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
