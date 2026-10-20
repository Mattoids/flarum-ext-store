import app from 'flarum/admin/app';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import type Mithril from 'mithril';
import Button from 'flarum/common/components/Button';
import Stream from 'flarum/common/utils/Stream';
import Switch from 'flarum/common/components/Switch';
import Select from 'flarum/common/components/Select';
import extractText from 'flarum/common/utils/extractText';
import LoadingBlock from './LoadingBlock';
import PaginatedList from './PaginatedList';

export interface IStoreGoodsDetailModalAttrs extends IInternalModalAttrs {
  storeData?: StoreItemData;
  code?: string;
  title?: string;
  /** 保存成功回调（父组件局部刷新列表，替代整页 reload） */
  onSaved?: () => void;
}

export default class StoreGoodsDetailModal extends Modal<IStoreGoodsDetailModalAttrs> {
  private iconList: PaginatedList<{ attributes: { url: string } }> = new PaginatedList({
    endpoint: '/store/icon/list',
  });
  private itemTypes: any = [];
  private method: string = 'POST';
  private defaultsAppliedFor: string = '';
  /** 图标库面板开关：true 时 content 渲染图标库，false 渲染商品表单（状态驱动，替代原 jQuery 显隐切换） */
  private showIcons: boolean = false;
  private static pluginList: any = null;
  private params: Record<string, Stream<any>> = {
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
    useType: Stream('permanent'),
    subtype: Stream(''),
    group: Stream(''),
    purchaseLimitEnable: Stream(0),
    purchaseLimitCount: Stream(0),
    purchaseLimitPeriod: Stream(0),
    purchaseLimitPeriodUnit: Stream('days'),
    usable: Stream(0),
  };

  oninit(vnode: Mithril.Vnode<IStoreGoodsDetailModalAttrs, this>) {
    super.oninit(vnode);

    this.method = 'POST';
    this.showIcons = false;
    this.params.code = Stream(this.attrs.code || '');
    this.params.title = Stream(this.attrs.title || '');

    if (this.attrs.storeData) {
      this.method = 'PUT';
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
      this.params.useType = Stream(this.attrs.storeData.useType || 'permanent');
      this.params.subtype = Stream(this.attrs.storeData.subtype || '');
      this.params.group = Stream(this.attrs.storeData.group || '');
      this.params.purchaseLimitEnable = Stream(this.attrs.storeData.purchaseLimitEnable || 0);
      this.params.purchaseLimitCount = Stream(this.attrs.storeData.purchaseLimitCount || 0);
      this.params.purchaseLimitPeriod = Stream(this.attrs.storeData.purchaseLimitPeriod || 0);
      this.params.purchaseLimitPeriodUnit = Stream(this.attrs.storeData.purchaseLimitPeriodUnit || 'days');
      this.params.usable = Stream(this.attrs.storeData.usable || 0);
    }

    this.loadPlugins();
  }

  /**
   * 加载已注册商品插件列表（运行时注册表），用于 subtype 下拉选项
   */
  loadPlugins() {
    if (StoreGoodsDetailModal.pluginList) {
      this.applyItemTypes();
      return;
    }

    app.store
      .find('/store/goods')
      .then((results) => {
        StoreGoodsDetailModal.pluginList = results.payload.data || [];
        this.applyItemTypes();
        m.redraw();
      })
      .catch(() => {
        StoreGoodsDetailModal.pluginList = [];
        this.applyItemTypes();
      });
  }

  applyItemTypes() {
    const code = this.params.code ? this.params.code() : this.attrs.code || '';
    const plugin = (StoreGoodsDetailModal.pluginList || []).find((p: any) => p.attributes && p.attributes.code === code);
    this.itemTypes = plugin && plugin.attributes.itemTypes ? plugin.attributes.itemTypes : [];
    this.applyPluginDefaults(code, plugin);
    m.redraw();
  }

  /**
   * 新增商品（无 storeData）时，用商品插件在 Goods 抽象类上声明的
   * 有效期/限购默认值填充表单；编辑已有商品时不覆盖库中值。
   * 每个 code 只应用一次，避免异步加载完成后覆盖用户已修改的内容。
   */
  applyPluginDefaults(code: string, plugin: any) {
    if (this.attrs.storeData || !plugin) {
      return;
    }
    if (this.defaultsAppliedFor === code) {
      return;
    }

    const defaults = plugin.attributes || {};
    const fields = ['outtime', 'purchaseLimitEnable', 'purchaseLimitCount', 'purchaseLimitPeriod', 'purchaseLimitPeriodUnit', 'usable'];
    const hasAny = fields.some((key) => defaults[key] !== null && defaults[key] !== undefined);
    if (!hasAny) {
      this.defaultsAppliedFor = code;
      return;
    }

    fields.forEach((key) => {
      if (defaults[key] !== null && defaults[key] !== undefined) {
        this.params[key] = Stream(key === 'purchaseLimitPeriodUnit' ? String(defaults[key]) : Number(defaults[key]));
      }
    });

    this.defaultsAppliedFor = code;
  }

  className(): string {
    return 'Modal--large StoreGoodsModal';
  }

  title(): Mithril.Children {
    return this.showIcons ? extractText(app.translator.trans('mattoid-store.admin.settings.show-icon-button')) : this.attrs.title || '';
  }

  content(): Mithril.Children {
    return (
      <div className="Modal-body">
        <div className="Form StoreGoodsForm">{this.showIcons ? this.renderIconPanel() : this.renderGoodsForm()}</div>
      </div>
    );
  }

  renderGoodsForm(): Mithril.Children {
    return (
      <div className="Form-group">
        {/* 顶部状态栏：状态 / 重复购买 / 隐藏 / 插件编码 */}
        <div className="StoreGoodsHeader">
          <div className="StoreGoodsHeader-switches">
            <div className="StoreAdminInline">
              <span className="StoreGoodsHeader-label">{app.translator.trans('mattoid-store.admin.settings.goods-status')}</span>
              <Switch
                state={this.params.status()}
                onchange={(val: boolean) => {
                  this.params.status = Stream(Number(val));
                }}
              >
                {' '}
              </Switch>
            </div>
            <div className="StoreAdminInline">
              <Switch
                state={this.params.repeat()}
                onchange={(val: boolean) => {
                  this.params.repeat = Stream(Number(val));
                }}
              >
                {app.translator.trans('mattoid-store.admin.settings.goods-repeat')}
              </Switch>
            </div>
            <div className="StoreAdminInline">
              <Switch
                state={this.params.hide()}
                onchange={(val: boolean) => {
                  this.params.hide = Stream(Number(val));
                }}
              >
                {app.translator.trans('mattoid-store.admin.settings.goods-hide')}
              </Switch>
            </div>
          </div>
          <span className="StoreCodeChip StoreGoodsHeader-code"> {this.params.code()} </span>
        </div>

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-basic')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminField">
              <label>{app.translator.trans('mattoid-store.admin.settings.goods-title')}</label>
              <input required class="FormControl" type="text" bidi={this.params.title} />
            </div>
            {!(app as any).storeAdminRegistry?.goodsForm?.getOptions(this.params.code()).hideDefaultDesc && (
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-desc')}</label>
                <textarea class="FormControl" bidi={this.params.desc} rows="3"></textarea>
              </div>
            )}
          </div>
        </section>

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-price')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminGrid StoreAdminGrid--price">
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-price')}</label>
                <input required class="FormControl" type="number" step="1" min="0" bidi={this.params.price} />
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-stock')}</label>
                <input required class="FormControl" type="number" step="1" min="0" bidi={this.params.stock} />
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-discount')}</label>
                <input required class="FormControl" type="number" step="1" min="0" bidi={this.params.discount} />
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-discount-limit')}</label>
                <input required class="FormControl" type="number" step="1" min="0" bidi={this.params.discountLimit} />
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-discount-limit-unit')}</label>
                {Select.component({
                  options: {
                    days: app.translator.trans('mattoid-store.lib.item-limit-unit-days'),
                    hour: app.translator.trans('mattoid-store.lib.item-limit-unit-hour'),
                    minute: app.translator.trans('mattoid-store.lib.item-limit-unit-minute'),
                    second: app.translator.trans('mattoid-store.lib.item-limit-unit-second'),
                  },
                  value: this.params.discountLimitUnit(),
                  onchange: (val: string) => {
                    this.params.discountLimitUnit = Stream(val);
                  },
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-validity')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminGrid">
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-type')}</label>
                {Select.component({
                  options: {
                    permanent: app.translator.trans('mattoid-store.lib.item-type-permanent'),
                    limit: app.translator.trans('mattoid-store.lib.item-type-limit'),
                  },
                  value: this.params.type(),
                  onchange: (val: string) => {
                    this.params.type = Stream(val);
                  },
                })}
              </div>
              {this.params.type() === 'limit' && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-outtime')}</label>
                  <div className="StoreAdminInline">
                    <input required class="FormControl" type="number" bidi={this.params.outtime} />
                    <span className="StoreAdminUnit">{app.translator.trans('mattoid-store.admin.settings.days')}</span>
                  </div>
                </div>
              )}
              {this.params.type() === 'limit' && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-auto-deduction')}</label>
                  <div className="StoreAdminInline">
                    <Switch
                      state={this.params.autoDeduction()}
                      onchange={(val: boolean) => {
                        this.params.autoDeduction = Stream(Number(val));
                      }}
                    ></Switch>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-purchase-limit')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminGrid StoreAdminGrid--4col">
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-purchase-limit-enable')}</label>
                <div className="StoreAdminInline">
                  <Switch
                    state={!!this.params.purchaseLimitEnable()}
                    onchange={(val: boolean) => {
                      this.params.purchaseLimitEnable = Stream(Number(val));
                    }}
                  ></Switch>
                </div>
              </div>
              {!!this.params.purchaseLimitEnable() && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-purchase-limit-count')}</label>
                  <input required class="FormControl" type="number" step="1" min="1" bidi={this.params.purchaseLimitCount} />
                </div>
              )}
              {!!this.params.purchaseLimitEnable() && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-purchase-limit-period')}</label>
                  <input required class="FormControl" type="number" step="1" min="0" bidi={this.params.purchaseLimitPeriod} />
                </div>
              )}
              {!!this.params.purchaseLimitEnable() && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-purchase-limit-period-unit')}</label>
                  {Select.component({
                    options: {
                      days: app.translator.trans('mattoid-store.lib.item-limit-unit-days'),
                      hour: app.translator.trans('mattoid-store.lib.item-limit-unit-hour'),
                      minute: app.translator.trans('mattoid-store.lib.item-limit-unit-minute'),
                      second: app.translator.trans('mattoid-store.lib.item-limit-unit-second'),
                    },
                    value: this.params.purchaseLimitPeriodUnit(),
                    onchange: (val: string) => {
                      this.params.purchaseLimitPeriodUnit = Stream(val);
                    },
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-item')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminGrid StoreAdminGrid--4col">
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-group')}</label>
                <input
                  class="FormControl"
                  type="text"
                  bidi={this.params.group}
                  placeholder={app.translator.trans('mattoid-store.admin.settings.goods-group-placeholder')}
                />
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-usable')}</label>
                <div className="StoreAdminInline">
                  <Switch
                    state={!!this.params.usable()}
                    onchange={(val: boolean) => {
                      this.params.usable = Stream(Number(val));
                    }}
                  >
                    {app.translator.trans('mattoid-store.admin.settings.goods-usable')}
                  </Switch>
                </div>
              </div>
              <div className="StoreAdminField">
                <label>{app.translator.trans('mattoid-store.admin.settings.goods-use-type')}</label>
                <div className="StoreAdminInline">
                  <Switch
                    state={this.params.useType() === 'consumable'}
                    onchange={(val: boolean) => {
                      this.params.useType = Stream(val ? 'consumable' : 'permanent');
                    }}
                  >
                    {app.translator.trans('mattoid-store.lib.item-use-type-consumable')}
                  </Switch>
                </div>
              </div>
              {this.itemTypes.length > 0 && (
                <div className="StoreAdminField">
                  <label>{app.translator.trans('mattoid-store.admin.settings.goods-subtype')}</label>
                  {Select.component({
                    options: Object.assign(
                      { '': app.translator.trans('mattoid-store.admin.settings.goods-subtype-none') },
                      ...this.itemTypes.map((t: any) => ({ [t.key]: app.translator.trans(t.name || t.key) }))
                    ),
                    value: this.params.subtype(),
                    onchange: (val: string) => {
                      this.params.subtype = Stream(val);
                    },
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {(() => {
          const CustomForm = (app as any).storeAdminRegistry?.goodsForm?.get(this.params.code());
          return CustomForm ? (
            <section className="StoreAdminCard StoreAdminCard--plugin">
              <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-plugin')}</div>
              <div className="StoreAdminCard-body">
                <CustomForm params={this.params} storeData={this.attrs.storeData} />
              </div>
            </section>
          ) : null;
        })()}

        <section className="StoreAdminCard">
          <div className="StoreAdminCard-title">{app.translator.trans('mattoid-store.admin.settings.section-icon')}</div>
          <div className="StoreAdminCard-body">
            <div className="StoreAdminIconRow">
              <div className="StoreAdminIconRow-main">
                <div className="StoreAdminField">
                  <div className="StoreAdminInline">
                    <input id="icon" required class="FormControl" type="text" bidi={this.params.icon} />
                    <Button
                      className="Button"
                      onclick={(e: Event) => {
                        this.uploadIcon(e);
                      }}
                    >
                      {app.translator.trans('mattoid-store.admin.settings.goods-upload-button')}
                    </Button>
                    <Button
                      className="Button"
                      onclick={(e: Event) => {
                        this.showIcon(e);
                      }}
                    >
                      {app.translator.trans('mattoid-store.admin.settings.show-icon-button')}
                    </Button>
                  </div>
                </div>
                <div className="helpText">{app.translator.trans('mattoid-store.admin.settings.goods-icon-hint')}</div>
              </div>
              <div className="StoreAdminField StoreAdminIconRow-preview" style={this.params.icon() ? '' : 'display: none'}>
                <div className="StoreIconPreview">
                  {this.isImageIcon(this.params.icon()) ? (
                    <img
                      src={this.params.icon()}
                      alt=""
                      style={this.params.icon() && this.params.icon().slice(-5) === '.webm' ? 'display: none' : ''}
                    />
                  ) : (
                    <div className="StoreIconEffectPreview">
                      <div className={this.params.icon()}>{app.translator.trans('mattoid-store.admin.settings.goods-icon-effect-preview')}</div>
                      <span className="StoreIconEffectClassName">{this.params.icon()}</span>
                    </div>
                  )}
                  <video
                    autoplay
                    loop
                    muted
                    playsinline
                    style={this.params.icon() && this.params.icon().slice(-5) === '.webm' ? '' : 'display: none'}
                  >
                    <source src={this.params.icon()} type="video/webm" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="StoreGoodsSubmit">
          {Button.component(
            {
              className: 'Button Button--primary',
              type: 'submit',
              loading: this.loading,
            },
            this.params.id
              ? app.translator.trans('mattoid-store.admin.settings.edit-store-goods')
              : app.translator.trans('mattoid-store.admin.settings.add-store-goods')
          )}
        </div>
      </div>
    );
  }

  renderIconPanel(): Mithril.Children {
    return (
      <div className="Form-group">
        <div className="StoreAdminIconBack">
          <Button className="Button" onclick={() => this.closeIcon()}>
            {app.translator.trans('mattoid-store.admin.settings.goods-icon-back')}
          </Button>
        </div>
        {(() => {
          const IconPicker = (app as any).storeAdminRegistry?.iconPicker?.get(this.params.code());
          if (IconPicker) {
            return <IconPicker params={this.params} onSelect={(url: string) => this.selectIconItem(url)} />;
          }
          return (
            <div>
              {this.iconList.items.map((item: { attributes: { url: string } }) => {
                return (
                  <div
                    className="icon-frame inlineBlock"
                    role="button"
                    tabindex={0}
                    aria-label={extractText(app.translator.trans('mattoid-store.admin.settings.goods-icon'))}
                    onclick={() => this.selectIconItem(item.attributes.url)}
                    onkeydown={(e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectIconItem(item.attributes.url);
                      }
                    }}
                  >
                    <img
                      className="icon-size"
                      alt=""
                      src={item.attributes.url}
                      style={item.attributes.url && item.attributes.url.slice(-5) === '.webm' ? 'display: none' : ''}
                    />
                    <video
                      autoplay
                      loop
                      muted
                      playsinline
                      className="icon-size"
                      style={item.attributes.url && item.attributes.url.slice(-5) === '.webm' ? '' : 'display: none'}
                    >
                      <source src={item.attributes.url} type="video/webm" />
                    </video>
                  </div>
                );
              })}
              {!this.iconList.loading && this.iconList.items.length === 0 && (
                <div>
                  <div style="font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;">
                    {app.translator.trans('mattoid-store.lib.list-empty')}
                  </div>
                </div>
              )}

              {!this.iconList.loading && this.iconList.hasMore() && (
                <div style="text-align:center;padding:20px">
                  <Button
                    className={'Button Button--primary'}
                    disabled={this.iconList.loading}
                    loading={this.iconList.loading}
                    onclick={() => this.iconList.loadMore()}
                  >
                    {app.translator.trans('mattoid-store.lib.list-load-more')}
                  </Button>
                </div>
              )}

              {this.iconList.loading && <LoadingBlock />}
            </div>
          );
        })()}
      </div>
    );
  }

  /**
   * icon 是否为图片/视频地址；CSS 类名（如用户名颜色 decorationStoreColorText2）
   * 不含路径分隔符或扩展名，不能作为图片 src 渲染
   */
  isImageIcon(icon: string): boolean {
    if (!icon) {
      return false;
    }
    if (icon.indexOf('/') === -1 && icon.indexOf('.') === -1) {
      return false;
    }
    return icon.slice(-5) !== '.webm';
  }

  closeIcon() {
    this.showIcons = false;
  }

  selectIconItem(url: string) {
    this.showIcons = false;
    this.params.icon(url);
  }

  showIcon(event: Event) {
    event.preventDefault();
    this.showIcons = true;

    // 商品插件注册了自定义图库（iconPicker）时，不加载默认上传图片列表
    if (!(app as any).storeAdminRegistry?.iconPicker?.get(this.params.code())) {
      this.iconList.refresh();
    }
  }

  uploadIcon(event: Event) {
    event.preventDefault();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webm';
    input.style.display = 'none';
    input.addEventListener(
      'change',
      () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file) return;

        const body = new FormData();
        body.append('file', file);
        this.loading = true;

        app
          .request({
            url: `${app.forum.attribute('apiUrl')}/store/upload/icon`,
            method: 'POST',
            body,
          })
          .then(
            (result: any) => {
              this.params.icon = Stream(result.data.attributes.path);
              this.loading = false;
              m.redraw();
            },
            (error: any) => {
              this.loading = false;
              this.onerror(error);
            }
          );
      },
      { once: true }
    );
    document.body.appendChild(input);
    input.click();
  }

  onsubmit(e: Event) {
    e.preventDefault();

    this.loading = true;

    app
      .request({
        method: this.method,
        url: app.forum.attribute('apiUrl') + '/store/goods',
        body: this.params,
      })
      .then(
        () => {
          this.loading = false;
          if (this.attrs.onSaved) {
            this.attrs.onSaved();
          }
          this.hide();
        },
        (error: any) => {
          this.loading = false;
          this.onerror(error);
        }
      );
  }
}
