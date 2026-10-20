import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';

export default class GiftGoodsModal extends Modal {
  private storeData: any = {};
  private allUsers: boolean = false;
  private amount: any = Stream('1');
  private selectedUsers: any[] = [];
  private search: string = '';
  private searchResults: any[] = [];
  private confirmed: boolean = false;
  private result: any = null;
  private searchTimer: any = null;
  private searchSeq: number = 0;

  oninit(vnode) {
    super.oninit(vnode);
    this.storeData = this.attrs.storeData;
  }

  onremove(vnode) {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }

  className() {
    return 'Modal--small GiftGoodsModal';
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.gift-goods-title', { title: this.storeData.title });
  }

  content() {
    if (this.result) {
      return this.renderResult();
    }

    return (
      <div className="Modal-body">
        <form
          onsubmit={(e) => {
            e.preventDefault();
            this.onsubmit(e);
          }}
        >
          <div className="Form-group">
            <label>{app.translator.trans('mattoid-store.admin.settings.gift-target')}</label>
            <div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={this.allUsers}
                  onchange={(e: InputEvent) => {
                    this.allUsers = (e.target as HTMLInputElement).checked;
                  }}
                />
                {app.translator.trans('mattoid-store.admin.settings.gift-all-users')}
              </label>
            </div>
          </div>

          {!this.allUsers && (
            <div className="Form-group">
              <label>{app.translator.trans('mattoid-store.admin.settings.gift-select-users')}</label>
              {this.selectedUsers.length > 0 && (
                <div className="GiftGoodsModal-selected">
                  {this.selectedUsers.map((user, index) => (
                    <span className="StoreCodeChip" key={user.id()}>
                      {user.displayName() || user.username()}
                      <i
                        className="fas fa-times GiftGoodsModal-remove"
                        onclick={() => {
                          this.selectedUsers.splice(index, 1);
                        }}
                      />
                    </span>
                  ))}
                </div>
              )}
              <input
                className="FormControl"
                type="text"
                value={this.search}
                placeholder={app.translator.trans('mattoid-store.admin.settings.gift-search-user-placeholder')}
                oninput={(e: InputEvent) => {
                  this.search = (e.target as HTMLInputElement).value;
                  this.queueSearch();
                }}
              />
              {this.searchResults.length > 0 && (
                <ul className="GiftGoodsModal-results">
                  {this.searchResults.map((user) => (
                    <li key={user.id()} onclick={() => this.addUser(user)}>
                      {user.displayName() || user.username()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {this.allUsers && (
            <div className="Form-group GiftGoodsModal-warning">
              <i className="fas fa-exclamation-triangle" />
              {app.translator.trans('mattoid-store.admin.settings.gift-all-users-warning')}
            </div>
          )}

          <div className="Form-group">
            <label>{app.translator.trans('mattoid-store.admin.settings.gift-amount')}</label>
            <input
              className="FormControl"
              type="number"
              min="1"
              max="99"
              value={this.amount()}
              oninput={(e: InputEvent) => {
                this.amount((e.target as HTMLInputElement).value);
              }}
            />
          </div>

          <div className="Form-group StoreConfirmActions">
            <Button
              className="Button Button--primary"
              type="submit"
              loading={this.loading}
              disabled={!this.allUsers && this.selectedUsers.length === 0}
            >
              {app.translator.trans('mattoid-store.lib.confirm')}
            </Button>
            <Button className="Button storeButton--gray" onclick={() => this.hide()}>
              {app.translator.trans('mattoid-store.lib.cancel')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  renderResult() {
    const failed = this.result.failed || {};
    return (
      <div className="Modal-body">
        <div className="Form-group">
          <p>
            {app.translator.trans('mattoid-store.admin.settings.gift-result-success', {
              users: this.result.successUsers,
              count: this.result.successCount,
            })}
          </p>
          {(failed.insufficientStock > 0 || failed.other > 0) && (
            <div className="GiftGoodsModal-warning">
              {failed.insufficientStock > 0 && (
                <p>{app.translator.trans('mattoid-store.admin.settings.gift-result-failed-stock', { count: failed.insufficientStock })}</p>
              )}
              {failed.alreadyOwned > 0 && (
                <p>{app.translator.trans('mattoid-store.admin.settings.gift-result-failed-owned', { count: failed.alreadyOwned })}</p>
              )}
              {failed.other > 0 && <p>{app.translator.trans('mattoid-store.admin.settings.gift-result-failed-other', { count: failed.other })}</p>}
            </div>
          )}
        </div>
        <div className="Form-group StoreConfirmActions">
          <Button className="Button Button--primary" onclick={() => this.hide()}>
            {app.translator.trans('mattoid-store.lib.confirm')}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 300ms 防抖，避免每击键一次 API 请求
   */
  queueSearch() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      this.searchUsers();
    }, 300);
  }

  searchUsers() {
    const keyword = this.search.trim();
    if (!keyword) {
      this.searchResults = [];
      return;
    }
    const seq = ++this.searchSeq;
    app.store
      .find('users', { filter: { q: keyword }, page: { limit: 10 } })
      .then((results) => {
        if (seq !== this.searchSeq) return;
        this.searchResults = results.filter((user) => {
          return !this.selectedUsers.some((selected) => selected.id() === user.id());
        });
      })
      .catch(() => {})
      .then(() => {
        m.redraw();
      });
  }

  addUser(user) {
    this.selectedUsers.push(user);
    this.searchResults = this.searchResults.filter((item) => item.id() !== user.id());
  }

  onsubmit() {
    if (this.allUsers && !this.confirmed) {
      // 全体用户模式：二次确认
      if (!confirm(app.translator.trans('mattoid-store.admin.settings.gift-all-users-confirm'))) {
        return;
      }
      this.confirmed = true;
    }

    const amount = parseInt(this.amount(), 10);
    if (!amount || amount < 1 || amount > 99) {
      this.onerror(new Error(app.translator.trans('mattoid-store.admin.settings.gift-amount-invalid')));
      return;
    }

    this.loading = true;

    app
      .request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/store/gift/goods',
        body: {
          storeId: this.storeData.id,
          userIds: this.selectedUsers.map((user) => user.id()),
          allUsers: this.allUsers,
          amount: amount,
        },
      })
      .then(
        (result) => {
          this.loading = false;
          this.result = result;
          m.redraw();
        },
        (error) => {
          this.loading = false;
          this.onerror(error);
        }
      );
  }
}
