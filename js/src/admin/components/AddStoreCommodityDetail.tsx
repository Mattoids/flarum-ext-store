import app from 'flarum/admin/app';
import Modal, {IInternalModalAttrs} from "flarum/common/components/Modal";
import Button from 'flarum/common/components/Button';
import Switch from "flarum/common/components/Switch";
import Select from "flarum/common/components/Select";
import Stream from 'flarum/common/utils/Stream';
import type Mithril from 'mithril';

interface ISubscriptionModalAttrs extends IInternalModalAttrs {
  code: string;
  title: string;
}

export default class AddStoreCommodityDetail extends Modal<ISubscriptionModalAttrs> {

  private params = {
    status: 1,
    code: Stream(),
    title: Stream(),
    desc: Stream(),
    price: Stream(),
    stock: Stream(),
    discount: Stream(),
    limit: Stream(),
    limitUnit: 'day',
    type: 'permanent',
    outtime: Stream(),
    icon: Stream(),
    hide: 0
  }

  static initAttrs(attrs: ISubscriptionModalAttrs) {
    super.initAttrs(attrs);
  }

  oninit(vnode: Mithril.Vnode<ISubscriptionModalAttrs, this>) {
    super.oninit(vnode);

    this.params.code = Stream(this.attrs.code || '');
    this.params.title = Stream(this.attrs.title || '');
  }

  title() {
    return this.attrs.title;
  }

  className(): string {
    return "";
  }

  content() {
    return (
      <form>
        <div className="Modal-body DecorationStoreModalBody">
          <div className="Form">
            <div className="Form-group">
              <div style="text-align: left;">
                <div class="decorationStoreSettingsLabel" style="display: flex; align-items: center;">
                  <span>{app.translator.trans("mattoid-store.admin.settings.commodity-status")}</span>
                  <span style="margin-left: 15px;">
                    <Switch state={this.params.status}
                            onchange={(val) => {
                              this.params.status = val
                            }}
                    > </Switch>
                  </span>
                </div>
                <div class="decorationStoreSettingsLabel" style="display: flex; align-items: center;">
                  <span>{app.translator.trans("mattoid-store.admin.settings.commodity-code")}  </span>
                  <span
                    style="font-weight: normal; cursor: pointer; border-bottom: 2px dotted;"> {this.attrs.code} </span>
                </div>
                <div class="decorationStoreSettingsLabel" style="align-items: center;">
                  <div
                    className="decorationStoreSettingsLabel">{app.translator.trans("mattoid-store.admin.settings.commodity-title")}
                  </div>
                  <input required class="FormControl" type="text" bidi={this.params.title}/>
                </div>
                <div class="decorationStoreSettingsLabel" style="align-items: center;">
                  <div
                    className="decorationStoreSettingsLabel">{app.translator.trans("mattoid-store.admin.settings.commodity-desc")}
                  </div>
                  <textarea class="FormControl" bidi={this.params.desc}></textarea>
                </div>

                <div className="spacing">
                  <div
                    style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.commodity-price")}</div>
                  <input required class="FormControl" type="number" step="1" min="0"
                         style="width: 195px; margin-left: 0px; display: inline-block;" bidi={this.params.price}/>

                  <div
                    style="width: 60px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-stock")}</div>
                  <input required class="FormControl" type="number" step="1" min="0"
                         style="width: 195px; margin-left: 0px; display: inline-block;" bidi={this.params.stock}/>
                </div>

                <div className="spacing">
                  <div
                    style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.commodity-discount")}</div>
                  <input required class="FormControl" type="number" step="1" min="0"
                         style="width: 100px; margin-left: 0px; display: inline-block;" bidi={this.params.discount}/>

                  <div
                    style="width: 60px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-discount-limit")}</div>
                  <input required class="FormControl" type="number" step="1" min="0"
                         style="width: 145px; margin-left: 0px; display: inline-block;" bidi={this.params.limit}/>

                  <div
                    style="width: 40px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-discount-limit-unit")}</div>
                  {Select.component({
                    options: {'day': '天', 'hour': '小时', 'minute': '分钟', 'second': '秒'},
                    value: this.params.limitUnit,
                    onchange: (val) => {
                      this.params.limitUnit = val
                    },
                  })}
                </div>

                <div className="spacing">
                  <div style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.commodity-type")}</div>
                  {Select.component({
                    options: {'permanent': '永久有效', 'limit': '限时有效'},
                    value: this.params.type,
                    onchange: (val) => {
                      this.params.type = val
                    },
                  })}

                  <div style={ this.params.type === 'limit' ? 'display:inline-block' : 'display: none'}>
                    <div
                      style="width: 80px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-outtime")}</div>
                    <input required class="FormControl" type="number"
                           style="width: 200px; margin-left: 0px; display: inline-block;" bidi={this.params.outtime}/>
                    <span style="margin-left: 10px;">天</span>
                  </div>

                </div>

                <div className="spacing">
                  <div
                    className="decorationStoreSettingsLabel">{app.translator.trans("mattoid-store.admin.settings.commodity-icon")}
                  </div>
                  <div style="position: relative;">
                    <div>
                      <input id="icon" required class="FormControl" type="text" bidi={this.params.icon}/>
                    </div>
                    <div style="margin-top: 5px;">
                      <Button
                        className="Button Button--primary"
                        onclick={() => {

                        }}>
                        {app.translator.trans('mattoid-store.admin.settings.commodity-upload-button') }
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="spacing">
                  <Switch
                    state={this.params.hide}
                    onchange={(val) => {
                      this.params.hide = val
                    }}
                  >
                    {app.translator.trans(
                      "mattoid-store.admin.settings.commodity-hide"
                    )}
                  </Switch>
                </div>
              </div>

              <div className="spacing center">
                <Button
                  className="Button Button--primary"
                  onclick={() => {
                    this.loading = true;
                    this.addCommodity().then(res => {
                      this.hide();
                    }).catch(() => {
                      this.loading = false;
                      m.redraw();
                    });
                  }}>
                  {app.translator.trans('mattoid-store.admin.settings.add-store-commodity') }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }

  addCommodity() {
    return app.request<{ userMatchCount: number }>({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/store/commodity',
      body: this.params
    });
  }

}
