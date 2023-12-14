import app from 'flarum/admin/app';

app.initializers.add('mattoid/store', () => {
  console.log('[mattoid/store] Hello, admin!');
});
