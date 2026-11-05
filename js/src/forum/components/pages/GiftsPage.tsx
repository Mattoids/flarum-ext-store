import app from 'flarum/forum/app';
import type Mithril from 'mithril';
import dayjs from 'dayjs';

import UserPage from 'flarum/forum/components/UserPage';
import Button from 'flarum/common/components/Button';
import LoadingBlock from '../component/LoadingBlock';
import PaginatedList from '../PaginatedList';
import bindInfiniteScroll from '../../utils/bindInfiniteScroll';

/**
 * 赠送记录页（获赠视角）：与购买记录一致的列表形式
 * 展示当前用户收到的赠送（赠送人/商品/数量/时间）
 */
export default class GiftsPage extends UserPage {
  private list: PaginatedList<StoreApiResource> = new PaginatedList({
    endpoint: '/store/gift/list',
    clearItemsOnRefreshError: true,
  });
  private unbindScroll: (() => void) | null = null;

  oninit(vnode: Mithril.Vnode<any, this>) {
    super.oninit(vnode);

    this.loadUser(m.route.param('username'));

    this.list.refresh();
  }

  oncreate(vnode: Mithril.VnodeDOM<any, this>) {
    // 手机端瀑布流：滚动到底自动加载下一页
    this.unbindScroll = bindInfiniteScroll(this.list);
  }

  onremove(vnode: Mithril.VnodeDOM<any, this>) {
    if (this.unbindScroll) {
      this.unbindScroll();
      this.unbindScroll = null;
    }
  }

  content(): Mithril.Children {
    return (
      <div className="Post-body">
        <h2 class="BadgeOverviewTitle">{app.translator.trans('mattoid-store.forum.gifts')}</h2>
        <div className="Store-Body">
          <ul className="StoreRecordGrid">
          {this.list.items.map((item: StoreApiResource) => {
            const a = item.attributes || {};
            const from = a.fromUser || {};
            return (
              <li className="StoreRecordCard" key={item.id}>
                <div className="StoreRecordCard-header">
                  <span className="StoreRecordCard-stat-value StoreRecordCard-stat-value--main StoreRecordCard-stat-value--credit">
                    {a.title}
                    {a.amount > 1 && <em className="StoreRecordCard-amount"> ×{a.amount}</em>}
                  </span>
                  <span className="StoreRecordCard-stat-value StoreRecordCard-stat-value--time">
                    {a.createdAt ? dayjs(a.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </span>
                </div>
                <div className="StoreRecordCard-body">
                  <div className="StoreRecordCard-stat">
                    <span className="StoreRecordCard-stat-label">{app.translator.trans('mattoid-store.forum.gifts-from')}</span>
                    <span className="StoreRecordCard-stat-value">{from.displayName || from.username || '-'}</span>
                  </div>
                  <div className="StoreRecordCard-stat">
                    <span className="StoreRecordCard-stat-label">{app.translator.trans('mattoid-store.forum.gifts-got-at')}</span>
                    <span className="StoreRecordCard-stat-value">
                      {a.createdAt ? dayjs(a.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          </ul>

          {!this.list.loading && this.list.items.length === 0 && (
            <div>
              <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                {app.translator.trans('mattoid-store.forum.gifts-empty')}
              </div>
            </div>
          )}

          {this.list.hasMore() && (
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
