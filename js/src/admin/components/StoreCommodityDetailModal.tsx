import app from 'flarum/admin/app';
import Modal from 'flarum/components/Modal';
import Button from 'flarum/components/Button';
import Stream from "flarum/common/utils/Stream";
import Switch from "flarum/common/components/Switch";
import Select from "flarum/common/components/Select";

export default class StoreCommodityDetailModal extends Modal {

  private method: string = 'POST';
  private params: object = {
    status: Stream(1),
    code: Stream(),
    title: Stream(),
    desc: Stream(),
    price: Stream(),
    stock: Stream(),
    discount: Stream(),
    discountLimit: Stream(),
    discountLimitUnit: Stream('day'),
    type: Stream('permanent'),
    outtime: Stream(0),
    icon: Stream(),
    hide: Stream(0)
  };

  oninit(vnode) {
    super.oninit(vnode);

    this.method = 'POST';
    this.params.code = Stream(this.attrs.code || '');
    this.params.title = Stream(this.attrs.title || '');

    if (this.attrs.storeData) {
      this.method = 'PUT'
      this.params.id = Stream(this.attrs.storeData.id);
      this.params.status = Stream(this.attrs.storeData.status);
      this.params.code = Stream(this.attrs.storeData.code);
      this.params.title = Stream(this.attrs.storeData.title);
      this.params.desc = Stream(this.attrs.storeData.desc);
      this.params.price = Stream(this.attrs.storeData.price);
      this.params.stock = Stream(this.attrs.storeData.stock);
      this.params.discount = Stream(this.attrs.storeData.discount);
      this.params.discountLimit = Stream(this.attrs.storeData.discountLimit);
      this.params.discountLimitUnit = Stream(this.attrs.storeData.discountLimitUnit);
      this.params.type = Stream(this.attrs.storeData.type);
      this.params.outtime = Stream(this.attrs.storeData.outtime);
      this.params.icon = Stream(this.attrs.storeData.icon);
      this.params.hide = Stream(this.attrs.storeData.hide);
    }
  }

  className() {
    return '';
  }

  title() {
    return this.params.title();
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <div style="text-align: left;">
              <div class="spacing" style="display: flex; align-items: center;">
                <span>{app.translator.trans("mattoid-store.admin.settings.commodity-status")}</span>
                <span style="margin-left: 15px;">
                    <Switch state={this.params.status()}
                            onchange={(val) => {
                              this.params.status = Stream(val)
                            }}
                    > </Switch>
                  </span>
              </div>
              <div class="spacing" style="display: flex; align-items: center;">
                <span>{app.translator.trans("mattoid-store.admin.settings.commodity-code")}</span>
                <span
                  style="font-weight: normal; cursor: pointer; border-bottom: 2px dotted; margin-left: 15px;"> {this.params.code()} </span>
              </div>
              <div class="spacing" style="align-items: center;">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.commodity-title")}
                </div>
                <input required class="FormControl" type="text" bidi={this.params.title}/>
              </div>
              <div class="spacing" style="align-items: center;">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.commodity-desc")}
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
                       style="width: 145px; margin-left: 0px; display: inline-block;" bidi={this.params.discountLimit}/>

                <div
                  style="width: 40px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-discount-limit-unit")}</div>
                {Select.component({
                  options: {
                    'day': app.translator.trans("mattoid-store.lib.item-limit-unit-day"),
                    'hour': app.translator.trans("mattoid-store.lib.item-limit-unit-hour"),
                    'minute': app.translator.trans("mattoid-store.lib.item-limit-unit-minute"),
                    'second': app.translator.trans("mattoid-store.lib.item-limit-unit-second")
                  },
                  value: this.params.discountLimitUnit(),
                  onchange: (val) => {
                    this.params.discountLimitUnit = Stream(val)
                  },
                })}
              </div>

              <div className="spacing">
                <div
                  style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.commodity-type")}</div>
                {Select.component({
                  options: {
                    'permanent': app.translator.trans("mattoid-store.lib.item-type-permanent"),
                    'limit': app.translator.trans("mattoid-store.lib.item-type-limit")
                  },
                  value: this.params.type(),
                  onchange: (val) => {
                    this.params.type = Stream(val)
                  },
                })}

                <div style={this.params.type() === 'limit' ? 'display:inline-block' : 'display: none'}>
                  <div
                    style="width: 80px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.commodity-outtime")}</div>
                  <input required class="FormControl" type="number"
                         style="width: 200px; margin-left: 0px; display: inline-block;" bidi={this.params.outtime}/>
                  <span style="margin-left: 10px;">天</span>
                </div>

              </div>

              <div className="spacing">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.commodity-icon")}
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
                      {app.translator.trans('mattoid-store.admin.settings.commodity-upload-button')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="spacing">
                <Switch
                  state={this.params.hide()}
                  onchange={(val) => {
                    this.params.hide = Stream(val)
                  }}
                >
                  {app.translator.trans(
                    "mattoid-store.admin.settings.commodity-hide"
                  )}
                </Switch>
              </div>
            </div>

            <div className="spacing center">
              {Button.component(
                {
                  className: 'Button Button--primary',
                  type: 'submit',
                  loading: this.loading,
                },
                app.translator.trans('mattoid-store.admin.settings.edit-store-commodity')
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;

    app.request({
      method: this.method,
      url: app.forum.attribute('apiUrl') + '/store/commodity',
      body: this.params
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        this.handleErrors(result);
      });
  }
}
