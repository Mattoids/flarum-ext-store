import app from 'flarum/forum/app';
import Goods from "../common/Goods";

app.initializers.add('mattoid/store', () => {
  console.log('[mattoid/store] Hello, forum!');
});
