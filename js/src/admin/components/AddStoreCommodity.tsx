import app from 'flarum/admin/app';
import Modal, {IInternalModalAttrs} from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import React from "react";
import AddStoreCommodityDetail from "./AddStoreCommodityDetail";

export default class AddStoreCommodity extends Modal {
  private _list: any[]
  get list(): any[] {
    return this._list;
  }

  set list(value: any[]) {
    this._list = value;
  }

  oninit(vnode) {
    super.oninit(vnode);

    this.request().then(res => {
      this.list = res.data || []
    })
  }

  title() {
    return app.translator.trans('mattoid-store.admin.settings.add-store-commodity');
  }

  className(): string {
    return "";
  }

  content() {
    if (!this.list || this.list.length == 0) {
      return (
        <div className="body">
          <span className="text">暂无可用商品</span>
        </div>
      )
    }
    return (
      <div>
        {this.list.map((item: object, index: number) => (
          <div className="ExtensionPage-body">
            <div className="ExtensionPage-settings FlarumBadgesPage">
              <div className="container">
                <span>{item.attributes.name}</span>
                <Button
                  className="Button"
                  onclick={() => {
                    app.modal.show(AddStoreCommodityDetail, { code: item.attributes.code, title: item.attributes.name});
                  }}
                >
                  { app.translator.trans('mattoid-store.admin.settings.add-store-commodity') }
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  request() {
    return app.request<{ userMatchCount: number }>({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/store/commodity',
    });
  }

}
