import app from 'flarum/forum/app';
import {extend} from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import StorePage from "./components/StorePage";

app.initializers.add('mattoid/store', () => {
  app.routes.superStore = {
    path: '/super/store',
    component: StorePage,
  };

  extend(IndexPage.prototype, 'navItems', function (items) {
    if (!app.session.user.attribute('canStoreView')) {
      return false;
    }

    items.add('superStore', LinkButton.component({
      href: app.route('superStore'),
      icon: 'fas fa-store',
    }, app.forum.attribute("storeName") || app.translator.trans('mattoid-store.forum.tital')));
  });
});
