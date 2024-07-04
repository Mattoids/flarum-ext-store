import app from 'flarum/admin/app';
import Modal from 'flarum/components/Modal';
import Button from 'flarum/components/Button';
import Stream from "flarum/common/utils/Stream";
import Switch from "flarum/common/components/Switch";
import Select from "flarum/common/components/Select";

export default class StoreGoodsDetailModal extends Modal {

  private moreResults: boolean = false
  private iconList: Array = [];
  private method: string = 'POST';
  private params: object = {
    status: Stream(1),
    code: Stream(),
    title: Stream(),
    desc: Stream(),
    price: Stream(0),
    stock: Stream(0),
    discount: Stream(0),
    discountLimit: Stream(0),
    discountLimitUnit: Stream('days'),
    type: Stream('permanent'),
    outtime: Stream(0),
    icon: Stream(),
    hide: Stream(0),
    repeat: Stream(1),
    autoDeduction: Stream(0),
  };

  oninit(vnode) {
    super.oninit(vnode);

    this.method = 'POST';
    this.moreResults = false;
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
      this.params.stock = Stream(this.attrs.storeData.stock == -99 ? 0 : this.attrs.storeData.stock);
      this.params.discount = Stream(this.attrs.storeData.discount);
      this.params.discountLimit = Stream(this.attrs.storeData.discountLimit);
      this.params.discountLimitUnit = Stream(this.attrs.storeData.discountLimitUnit);
      this.params.type = Stream(this.attrs.storeData.type);
      this.params.outtime = Stream(this.attrs.storeData.outtime);
      this.params.icon = Stream(this.attrs.storeData.icon);
      this.params.hide = Stream(this.attrs.storeData.hide);
      this.params.repeat = Stream(this.attrs.storeData.repeat);
      this.params.autoDeduction = Stream(this.attrs.storeData.autoDeduction);
    }
  }

  className() {
    return '';
  }

  title() {
    return this.params.title();
  }

  onModalReady() {
    const _this = this;
    const closeButton = $(".Modal-close .Button");
    $(closeButton).prop('id', 'storeCloseButton');

    const closeButtonClone = closeButton.clone();
    $(closeButtonClone).prop('id', 'storeCloseIconButton');
    $(closeButtonClone).css('display', 'none');
    $(".Modal-close").append(closeButtonClone);

    $(closeButtonClone).on("click", function(){
      _this.closeIcon();
    });
  }

  content() {
    return (
      <div className="Modal-body" oncreate={this.onModalReady.bind(this)}>
        <div className="Form">
          <div id="StoreGoods" className="Form-group">
            <div style="text-align: left;">
              <div class="spacing" style="display: flex; align-items: center;">
                <span>{app.translator.trans("mattoid-store.admin.settings.goods-status")}</span>
                <span style="margin-left: 15px;">
                    <Switch state={this.params.status()}
                            onchange={(val) => {
                              this.params.status = Stream(Number(val))
                            }}
                    > </Switch>
                  </span>
              </div>
              <div class="spacing" style="display: flex; align-items: center;">
                <span>{app.translator.trans("mattoid-store.admin.settings.goods-code")}</span>
                <span
                  style="font-weight: normal; cursor: pointer; border-bottom: 2px dotted; margin-left: 15px;"> {this.params.code()} </span>
              </div>
              <div class="spacing" style="align-items: center;">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.goods-title")}
                </div>
                <input required class="FormControl" type="text" bidi={this.params.title}/>
              </div>
              <div class="spacing" style="align-items: center;">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.goods-desc")}
                </div>
                <textarea class="FormControl" bidi={this.params.desc}></textarea>
              </div>

              <div className="spacing">
                <div
                  style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.goods-price")}</div>
                <input required class="FormControl" type="number" step="1" min="0"
                       style="width: 195px; margin-left: 0px; display: inline-block;" bidi={this.params.price}/>

                <div
                  style="width: 60px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.goods-stock")}</div>
                <input required class="FormControl" type="number" step="1" min="0"
                       style="width: 195px; margin-left: 0px; display: inline-block;" bidi={this.params.stock}/>
              </div>

              <div className="spacing">
                <div
                  style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.goods-discount")}</div>
                <input required class="FormControl" type="number" step="1" min="0"
                       style="width: 100px; margin-left: 0px; display: inline-block;" bidi={this.params.discount}/>

                <div
                  style="width: 60px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.goods-discount-limit")}</div>
                <input required class="FormControl" type="number" step="1" min="0"
                       style="width: 145px; margin-left: 0px; display: inline-block;" bidi={this.params.discountLimit}/>

                <div
                  style="width: 40px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.goods-discount-limit-unit")}</div>
                {Select.component({
                  options: {
                    'days': app.translator.trans("mattoid-store.lib.item-limit-unit-days"),
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
                  style="width: 60px; display: inline-block;">{app.translator.trans("mattoid-store.admin.settings.goods-type")}</div>
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
                    style="width: 80px; display: inline-block; margin-left: 26px;">{app.translator.trans("mattoid-store.admin.settings.goods-outtime")}</div>
                  <input required class="FormControl" type="number"
                         style="width: 200px; margin-left: 0px; display: inline-block;" bidi={this.params.outtime}/>
                  <span style="margin-left: 10px;">{app.translator.trans("mattoid-store.admin.settings.days")}</span>
                </div>

              </div>

              <div className="spacing" style={this.params.type() === 'limit' ? 'display:inline-block' : 'display: none'}>
                <div style="width: 200px; display: inline-block;">
                  <Switch
                    state={this.params.autoDeduction()}
                    onchange={(val) => {
                      this.params.autoDeduction = Stream(Number(val))
                    }}
                  >
                    {app.translator.trans(
                      "mattoid-store.admin.settings.goods-auto-deduction"
                    )}
                  </Switch>
                </div>
              </div>

              <div className="spacing">
                <div
                  className="">{app.translator.trans("mattoid-store.admin.settings.goods-icon")}
                </div>
                <div style="position: relative;">
                  <div>
                    <input id="icon" required class="FormControl" type="text" bidi={this.params.icon}/>
                  </div>
                  <div style="margin-top: 5px; display: inline-block;">
                    <Button
                      className="Button Button--primary"
                      onclick={(e) => {
                        this.uploadIcon(e)
                      }}>
                      {app.translator.trans('mattoid-store.admin.settings.goods-upload-button')}
                    </Button>
                  </div>
                  <div style="margin-top: 5px; display: inline-block; margin-left: 26px;">
                    <Button
                      className="Button Button--primary"
                      onclick={(e) => {
                        this.showIcon(e);
                      }}>
                      {app.translator.trans('mattoid-store.admin.settings.show-icon-button')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="spacing" style={this.params.icon() ? '' : 'display: none'}>
                <img className="icon-size" src={this.params.icon()} />
              </div>

              <div className="spacing">
                <div style="width: 200px; display: inline-block;">
                  <Switch
                    state={this.params.repeat()}
                    onchange={(val) => {
                      this.params.repeat = Stream(Number(val))
                    }}
                  >
                    {app.translator.trans(
                      "mattoid-store.admin.settings.goods-repeat"
                    )}
                  </Switch>
                </div>
                <div style="width: 200px; display: inline-block; margin-left: 26px;">
                  <Switch
                    state={this.params.hide()}
                    onchange={(val) => {
                      this.params.hide = Stream(Number(val))
                    }}
                  >
                    {app.translator.trans(
                      "mattoid-store.admin.settings.goods-hide"
                    )}
                  </Switch>
                </div>
              </div>
            </div>

            <div className="spacing center">
              {Button.component(
                {
                  className: 'Button Button--primary',
                  type: 'submit',
                  loading: this.loading,
                },
                this.params.id ? app.translator.trans('mattoid-store.admin.settings.edit-store-goods') : app.translator.trans('mattoid-store.admin.settings.add-store-goods')
              )}
            </div>
          </div>

          <div id="StoreIcon" className="Form-group" style="display: none">
            <div>
              {
                this.iconList.map((item) => {
                  return (
                    <div className="icon-frame inlineBlock" onclick={() => this.selectIconItem(item.attributes.url)}>
                      <img className="icon-size" src={item.attributes.url}/>
                    </div>
                  )
                })
              }
            </div>
            {!this.loading && this.iconList.length===0 && (
              <div>
                <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">{app.translator.trans("mattoid-store.lib.list-empty")}</div>
              </div>
            )}

            {!this.loading && this.hasMoreResults() && (
              <div style="text-align:center;padding:20px">
                <Button className={'Button Button--primary'} disabled={this.loading} loading={this.loading} onclick={() => this.loadMore()}>
                  {app.translator.trans('mattoid-store.lib.list-load-more')}
                </Button>
              </div>
            )}

            {this.loading && <div className="Store-loadMore">{this.loading}</div>}
          </div>
        </div>
      </div>
    );
  }

  loadIconList(offset = 0) {
    this.loading = true;

    return app.store
      .find("/store/icon/list", {
        page: {
          offset,
        },
      })
      .catch(() => {})
      .then(this.parseResults.bind(this));
  }

  parseResults(results) {
    this.moreResults = !!results.payload.links && !!results.payload.links.next;
    [].push.apply(this.iconList, results.payload.data);
    this.loading = false;
    m.redraw();

    return results;
  }

  loadMore() {
    this.loading = true;
    this.loadIconList(this.iconList.length);
  }

  hasMoreResults() {
    return this.moreResults;
  }


  closeIcon() {
    $("#StoreGoods").css("display","block");
    $("#storeCloseButton").css("display","block");
    $("#StoreIcon").css("display","none");
    $("#storeCloseIconButton").css("display","none");
  }

  selectIconItem(url){
    $("#StoreGoods").css("display","block");
    $("#storeCloseButton").css("display","block");
    $("#StoreIcon").css("display","none");
    $("#storeCloseIconButton").css("display","none");
    this.params.icon(url);
  }

  showIcon(event) {
    $("#StoreGoods").css("display","none");
    $("#storeCloseButton").css("display","none");
    $("#StoreIcon").css("display","block");
    $("#storeCloseIconButton").css("display","block");
    this.params.title = Stream(app.translator.trans('mattoid-store.admin.settings.show-icon-button'));
    this.iconList = [];
    this.loadIconList();
  }

  uploadIcon(event) {
    event.preventDefault();

    const $input = $('<input type="file">');

    $input.appendTo('body').hide().trigger('click').on('change', event => {
      const body = new FormData();
      body.append('file', event.target.files[0])

      app.request({
        url: `${app.forum.attribute('apiUrl')}/store/upload/icon`,
        method: 'POST',
        body,
      }).then((result) => {
        this.params.icon = Stream(result.data.attributes.path)
        this.loading = false;
        m.redraw();
      });
    })

  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;

    app.request({
      method: this.method,
      url: app.forum.attribute('apiUrl') + '/store/goods',
      body: this.params
    }).then(
      () => location.reload(),
      (result) => {
        this.loading = false;
        this.handleErrors(result);
      });
  }
}
