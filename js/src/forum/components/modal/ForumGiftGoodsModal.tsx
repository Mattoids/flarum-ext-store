import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';

export default class ForumGiftGoodsModal extends Modal {
  private user: any = null;
  private goodsList: any[] = [];
  private storeId: any = Stream('');
  private amount: any = Stream('1');
  private result: any = null;

  oninit(vnode) {
    super.oninit(vnode);
    this.user = this.attrs.user;

    this.loading = true;
    app.store
      .find('/store/list', { filter: { status: '-1' }, page: { limit: 100 } })
      .then((results) => {
        this.goodsList = results && (results as any).payload ? (results as any).payload.data : [];
      })
      .catch(() => {})
      .then(() => {
        this.loading = false;
        m.redraw();
      });
  }

  className() {
    return 'Modal--small ForumGiftGoodsModal';
  }

  title() {
    return app.translator.trans('mattoid-store.forum.gift-goods-title', { username: this.user.displayName() || this.user.username() });
  }

  content() {
    if (this.result) {
      return (
        <div className="Modal-body">
          <div className="Form-group">
            <p>
              {app.translator.trans('mattoid-store.forum.gift-result-success', {
                count: this.result.successCount,
              })}
            </p>
            {this.result.failed && this.result.failed.alreadyOwned > 0 && (
              <p>{app.translator.trans('mattoid-store.forum.gift-result-failed-owned')}</p>
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

    return (
      <div className="Modal-body">
        <form
          onsubmit={(e) => {
            e.preventDefault();
            this.onsubmit(e);
          }}
        >
          <div className="Form-group">
            <label>{app.translator.trans('mattoid-store.forum.gift-target-user')}</label>
            <div className="FormControl" disabled>
              {this.user.displayName() || this.user.username()}
            </div>
          </div>

          <div className="Form-group">
            <label>{app.translator.trans('mattoid-store.forum.gift-select-goods')}</label>
            <select
              className="FormControl"
              value={this.storeId()}
              onchange={(e: InputEvent) => {
                this.storeId((e.target as HTMLSelectElement).value);
              }}
            >
              <option value="">{app.translator.trans('mattoid-store.forum.gift-select-goods-placeholder')}</option>
              {this.goodsList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.attributes.title}
                  {Number(item.attributes.status) !== 1 ? '（' + app.translator.trans('mattoid-store.lib.item-status-0') + '）' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="Form-group">
            <label>{app.translator.trans('mattoid-store.forum.gift-amount')}</label>
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
            <Button className="Button Button--primary" type="submit" loading={this.loading} disabled={!this.storeId()}>
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

  onsubmit() {
    const amount = parseInt(this.amount(), 10);
    if (!amount || amount < 1 || amount > 99) {
      this.onerror(new Error(app.translator.trans('mattoid-store.forum.gift-amount-invalid')));
      return;
    }
    if (!this.storeId()) {
      return;
    }

    this.loading = true;

    app
      .request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/store/gift/goods',
        body: {
          storeId: this.storeId(),
          userIds: [this.user.id()],
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
