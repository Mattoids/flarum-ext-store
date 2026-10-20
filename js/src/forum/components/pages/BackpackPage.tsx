import app from 'flarum/forum/app';
import type Mithril from 'mithril';

import UserPage from 'flarum/forum/components/UserPage';
import Button from 'flarum/common/components/Button';
import BackpackItem from '../component/BackpackItem';
import LoadingBlock from '../component/LoadingBlock';
import PaginatedList from '../PaginatedList';

export default class BackpackPage extends UserPage {
  private list: PaginatedList<StoreApiResource> = new PaginatedList({
    endpoint: '/store/backpack/list',
    // 保留原行为：整页刷新失败时清空列表
    clearItemsOnRefreshError: true,
  });

  oninit(vnode: Mithril.Vnode<any, this>) {
    super.oninit(vnode);

    this.loadUser(m.route.param('username'));

    this.list.refresh();
  }

  content(): Mithril.Children {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store.forum.backpack')}</h2>
        <div className="Store-Body Backpack-Body">
          {this.list.items.map((item: StoreApiResource) => {
            return (
              <div className="storeItemContainer backpackItemContainer" key={item.id}>
                {BackpackItem.component({ item: item, onChanged: () => this.list.refresh() })}
              </div>
            );
          })}

          {!this.list.loading && this.list.items.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.lib.backpack-empty')}
              </div>
            </div>
          )}

          {!this.list.loading && this.list.hasMore() && (
            <div style="text-align:center;padding:20px">
              <Button
                className={'Button Button--primary'}
                disabled={this.list.loading}
                loading={this.list.loading}
                onclick={() => this.list.loadMore()}
              >
                {app.translator.trans('mattoid-store.lib.list-load-more')}
              </Button>
            </div>
          )}

          {this.list.loading && <LoadingBlock />}
        </div>
      </div>
    );
  }
}
