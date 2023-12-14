import app from 'flarum/common/app';

app.initializers.add('mattoid/store', () => {
  console.log('[mattoid/store] Hello, forum and admin!');
});
