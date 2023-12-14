import app from 'flarum/admin/app';
import StatisticsPage from './components/StatisticsPage';

app.initializers.add('mattoid-store', () => {
  app.extensionData.for("mattoid-store").registerPage(StatisticsPage)
});
