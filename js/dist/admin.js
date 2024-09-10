/*! For license information please see admin.js.LICENSE.txt */
(()=>{var t={535:t=>{"use strict";var s=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable;t.exports=function(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var s={},o=0;o<10;o++)s["_"+String.fromCharCode(o)]=o;if("0123456789"!==Object.getOwnPropertyNames(s).map((function(t){return s[t]})).join(""))return!1;var i={};return"abcdefghijklmnopqrst".split("").forEach((function(t){i[t]=t})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},i)).join("")}catch(t){return!1}}()?Object.assign:function(t,a){for(var e,n,r=function(t){if(null==t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}(t),l=1;l<arguments.length;l++){for(var m in e=Object(arguments[l]))o.call(e,m)&&(r[m]=e[m]);if(s){n=s(e);for(var d=0;d<n.length;d++)i.call(e,n[d])&&(r[n[d]]=e[n[d]])}}return r}},488:(t,s,o)=>{"use strict";var i=o(535),a="function"==typeof Symbol&&Symbol.for;a&&Symbol.for("react.element"),a&&Symbol.for("react.portal"),a&&Symbol.for("react.fragment"),a&&Symbol.for("react.strict_mode"),a&&Symbol.for("react.profiler"),a&&Symbol.for("react.provider"),a&&Symbol.for("react.context"),a&&Symbol.for("react.forward_ref"),a&&Symbol.for("react.suspense"),a&&Symbol.for("react.memo"),a&&Symbol.for("react.lazy"),"function"==typeof Symbol&&Symbol.iterator;function e(t){for(var s="https://reactjs.org/docs/error-decoder.html?invariant="+t,o=1;o<arguments.length;o++)s+="&args[]="+encodeURIComponent(arguments[o]);return"Minified React error #"+t+"; visit "+s+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var n={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},r={};function l(t,s,o){this.props=t,this.context=s,this.refs=r,this.updater=o||n}function m(){}function d(t,s,o){this.props=t,this.context=s,this.refs=r,this.updater=o||n}l.prototype.isReactComponent={},l.prototype.setState=function(t,s){if("object"!=typeof t&&"function"!=typeof t&&null!=t)throw Error(e(85));this.updater.enqueueSetState(this,t,s,"setState")},l.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")},m.prototype=l.prototype;var c=d.prototype=new m;c.constructor=d,i(c,l.prototype),c.isPureReactComponent=!0;Object.prototype.hasOwnProperty},684:(t,s,o)=>{"use strict";o(488)}},s={};function o(i){var a=s[i];if(void 0!==a)return a.exports;var e=s[i]={exports:{}};return t[i](e,e.exports,o),e.exports}o.n=t=>{var s=t&&t.__esModule?()=>t.default:()=>t;return o.d(s,{a:s}),s},o.d=(t,s)=>{for(var i in s)o.o(s,i)&&!o.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:s[i]})},o.o=(t,s)=>Object.prototype.hasOwnProperty.call(t,s),o.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var i={};(()=>{"use strict";o.r(i);const t=flarum.core.compat["admin/app"];var s=o.n(t);function a(t,s){return a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,s){return t.__proto__=s,t},a(t,s)}function e(t,s){t.prototype=Object.create(s.prototype),t.prototype.constructor=t,a(t,s)}const n=flarum.core.compat["admin/components/ExtensionPage"];var r=o.n(n);const l=flarum.core.compat["common/components/Button"];var d=o.n(l);const c=flarum.core.compat["common/components/Modal"];var p=o.n(c);o(684);const u=flarum.core.compat["components/Modal"];var h=o.n(u);const g=flarum.core.compat["components/Button"];var y=o.n(g);const f=flarum.core.compat["common/utils/Stream"];var b=o.n(f);const v=flarum.core.compat["common/components/Switch"];var x=o.n(v);const N=flarum.core.compat["common/components/Select"];var w=o.n(N),k=function(t){function o(){for(var s,o=arguments.length,i=new Array(o),a=0;a<o;a++)i[a]=arguments[a];return(s=t.call.apply(t,[this].concat(i))||this).pageTitle="",s.moreResults=!1,s.iconList=[],s.method="POST",s.params={status:b()(1),code:b()(),title:b()(),desc:b()(),price:b()(0),stock:b()(0),discount:b()(0),discountLimit:b()(0),discountLimitUnit:b()("days"),type:b()("permanent"),outtime:b()(0),icon:b()(),hide:b()(0),repeat:b()(1),autoDeduction:b()(0)},s}e(o,t);var i=o.prototype;return i.oninit=function(s){t.prototype.oninit.call(this,s),this.method="POST",this.moreResults=!1,this.params.code=b()(this.attrs.code||""),this.params.title=b()(this.attrs.title||""),this.pageTitle=this.attrs.title,this.attrs.storeData&&(this.method="PUT",this.params.id=b()(this.attrs.storeData.id),this.params.status=b()(this.attrs.storeData.status),this.params.code=b()(this.attrs.storeData.code),this.params.title=b()(this.attrs.storeData.title),this.params.desc=b()(this.attrs.storeData.desc),this.params.price=b()(this.attrs.storeData.price),this.params.stock=b()(-99==this.attrs.storeData.stock?0:this.attrs.storeData.stock),this.params.discount=b()(this.attrs.storeData.discount),this.params.discountLimit=b()(this.attrs.storeData.discountLimit),this.params.discountLimitUnit=b()(this.attrs.storeData.discountLimitUnit),this.params.type=b()(this.attrs.storeData.type),this.params.outtime=b()(this.attrs.storeData.outtime),this.params.icon=b()(this.attrs.storeData.icon),this.params.hide=b()(this.attrs.storeData.hide),this.params.repeat=b()(this.attrs.storeData.repeat),this.params.autoDeduction=b()(this.attrs.storeData.autoDeduction))},i.className=function(){return""},i.title=function(){return this.pageTitle},i.onModalReady=function(){var t=this,s=$(".Modal-close .Button");$(s).prop("id","storeCloseButton");var o=s.clone();$(o).prop("id","storeCloseIconButton"),$(o).css("display","none"),$(".Modal-close").append(o),$(o).on("click",(function(){t.closeIcon()}))},i.content=function(){var t=this;return m("div",{className:"Modal-body",oncreate:this.onModalReady.bind(this)},m("div",{className:"Form"},m("div",{id:"StoreGoods",className:"Form-group"},m("div",{style:"text-align: left;"},m("div",{class:"spacing",style:"display: flex; align-items: center;"},m("span",null,s().translator.trans("mattoid-store.admin.settings.goods-status")),m("span",{style:"margin-left: 15px;"},m(x(),{state:this.params.status(),onchange:function(s){t.params.status=b()(Number(s))}}," "))),m("div",{class:"spacing",style:"display: flex; align-items: center;"},m("span",null,s().translator.trans("mattoid-store.admin.settings.goods-code")),m("span",{style:"font-weight: normal; cursor: pointer; border-bottom: 2px dotted; margin-left: 15px;"}," ",this.params.code()," ")),m("div",{class:"spacing",style:"align-items: center;"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.goods-title")),m("input",{required:!0,class:"FormControl",type:"text",bidi:this.params.title})),m("div",{class:"spacing",style:"align-items: center;"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.goods-desc")),m("textarea",{class:"FormControl",bidi:this.params.desc})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.goods-price")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 195px; margin-left: 0px; display: inline-block;",bidi:this.params.price}),m("div",{style:"width: 60px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.goods-stock")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 195px; margin-left: 0px; display: inline-block;",bidi:this.params.stock})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.goods-discount")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 100px; margin-left: 0px; display: inline-block;",bidi:this.params.discount}),m("div",{style:"width: 60px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.goods-discount-limit")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 145px; margin-left: 0px; display: inline-block;",bidi:this.params.discountLimit}),m("div",{style:"width: 40px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.goods-discount-limit-unit")),w().component({options:{days:s().translator.trans("mattoid-store.lib.item-limit-unit-days"),hour:s().translator.trans("mattoid-store.lib.item-limit-unit-hour"),minute:s().translator.trans("mattoid-store.lib.item-limit-unit-minute"),second:s().translator.trans("mattoid-store.lib.item-limit-unit-second")},value:this.params.discountLimitUnit(),onchange:function(s){t.params.discountLimitUnit=b()(s)}})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.goods-type")),w().component({options:{permanent:s().translator.trans("mattoid-store.lib.item-type-permanent"),limit:s().translator.trans("mattoid-store.lib.item-type-limit")},value:this.params.type(),onchange:function(s){t.params.type=b()(s)}}),m("div",{style:"limit"===this.params.type()?"display:inline-block":"display: none"},m("div",{style:"width: 80px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.goods-outtime")),m("input",{required:!0,class:"FormControl",type:"number",style:"width: 200px; margin-left: 0px; display: inline-block;",bidi:this.params.outtime}),m("span",{style:"margin-left: 10px;"},s().translator.trans("mattoid-store.admin.settings.days")))),m("div",{className:"spacing",style:"limit"===this.params.type()?"display:inline-block":"display: none"},m("div",{style:"width: 200px; display: inline-block;"},m("span",null,s().translator.trans("mattoid-store.admin.settings.goods-auto-deduction")),m("span",{style:"margin-left: 15px;"},m(x(),{state:this.params.autoDeduction(),onchange:function(s){t.params.autoDeduction=b()(Number(s))}})))),m("div",{className:"spacing"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.goods-icon")),m("div",{style:"position: relative;"},m("div",null,m("input",{id:"icon",required:!0,class:"FormControl",type:"text",bidi:this.params.icon})),m("div",{style:"margin-top: 5px; display: inline-block;"},m(y(),{className:"Button Button--primary",onclick:function(s){t.uploadIcon(s)}},s().translator.trans("mattoid-store.admin.settings.goods-upload-button"))),m("div",{style:"margin-top: 5px; display: inline-block; margin-left: 26px;"},m(y(),{className:"Button Button--primary",onclick:function(s){t.showIcon(s)}},s().translator.trans("mattoid-store.admin.settings.show-icon-button"))))),m("div",{className:"spacing",style:this.params.icon()?"":"display: none"},m("img",{className:"icon-size",src:this.params.icon(),style:".webm"===this.params.icon().slice(-5)?"display: none":""}),m("video",{autoplay:!0,loop:!0,muted:!0,playsinline:!0,className:"icon-size",style:".webm"===this.params.icon().slice(-5)?"":"display: none"},m("source",{src:this.params.icon(),type:"video/webm"}))),m("div",{className:"spacing"},m("div",{style:"width: 200px; display: inline-block;"},m(x(),{state:this.params.repeat(),onchange:function(s){t.params.repeat=b()(Number(s))}},s().translator.trans("mattoid-store.admin.settings.goods-repeat"))),m("div",{style:"width: 200px; display: inline-block; margin-left: 26px;"},m(x(),{state:this.params.hide(),onchange:function(s){t.params.hide=b()(Number(s))}},s().translator.trans("mattoid-store.admin.settings.goods-hide"))))),m("div",{className:"spacing center"},y().component({className:"Button Button--primary",type:"submit",loading:this.loading},this.params.id?s().translator.trans("mattoid-store.admin.settings.edit-store-goods"):s().translator.trans("mattoid-store.admin.settings.add-store-goods")))),m("div",{id:"StoreIcon",className:"Form-group",style:"display: none"},m("div",null,this.iconList.map((function(s){return m("div",{className:"icon-frame inlineBlock",onclick:function(){return t.selectIconItem(s.attributes.url)}},m("img",{className:"icon-size",src:s.attributes.url}))}))),!this.loading&&0===this.iconList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(y(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more"))),this.loading&&m("div",{className:"Store-loadMore"},this.loading))))},i.loadIconList=function(t){return void 0===t&&(t=0),this.loading=!0,s().store.find("/store/icon/list",{page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},i.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.iconList,t.payload.data),this.loading=!1,m.redraw(),t},i.loadMore=function(){this.loading=!0,this.loadIconList(this.iconList.length)},i.hasMoreResults=function(){return this.moreResults},i.closeIcon=function(){this.pageTitle=this.attrs.title,$("#StoreGoods").css("display","block"),$("#storeCloseButton").css("display","block"),$("#StoreIcon").css("display","none"),$("#storeCloseIconButton").css("display","none"),m.redraw()},i.selectIconItem=function(t){this.pageTitle=this.attrs.title,$("#StoreGoods").css("display","block"),$("#storeCloseButton").css("display","block"),$("#StoreIcon").css("display","none"),$("#storeCloseIconButton").css("display","none"),this.params.icon(t)},i.showIcon=function(t){$("#StoreGoods").css("display","none"),$("#storeCloseButton").css("display","none"),$("#StoreIcon").css("display","block"),$("#storeCloseIconButton").css("display","block"),this.pageTitle=s().translator.trans("mattoid-store.admin.settings.show-icon-button"),this.iconList=[],this.loadIconList()},i.uploadIcon=function(t){var o=this;t.preventDefault(),$('<input type="file">').appendTo("body").hide().trigger("click").on("change",(function(t){var i=new FormData;i.append("file",t.target.files[0]),s().request({url:s().forum.attribute("apiUrl")+"/store/upload/icon",method:"POST",body:i}).then((function(t){o.params.icon=b()(t.data.attributes.path),o.loading=!1,m.redraw()}))}))},i.onsubmit=function(t){var o=this;t.preventDefault(),this.loading=!0,s().request({method:this.method,url:s().forum.attribute("apiUrl")+"/store/goods",body:this.params}).then((function(){return location.reload()}),(function(t){o.loading=!1,o.handleErrors(t)}))},o}(h()),D=function(t){function o(){for(var s,o=arguments.length,i=new Array(o),a=0;a<o;a++)i[a]=arguments[a];return(s=t.call.apply(t,[this].concat(i))||this).goodsList=[],s.moreResults=!1,s}e(o,t);var i=o.prototype;return i.oninit=function(s){t.prototype.oninit.call(this,s),this.loadResults()},i.title=function(){return s().translator.trans("mattoid-store.admin.settings.add-store-goods")},i.className=function(){return""},i.content=function(){var t=this;return m("div",null,this.goodsList.map((function(t,o){return m("div",{className:"storeItemContainer",style:"margin: 10px"},m("div",{className:"ExtensionPage-body"},m("div",{className:"ExtensionPage-settings FlarumBadgesPage",style:"margin-top: 10px"},m("div",{className:"container"},m("span",{className:"leftAligned",style:"padding: 8px"},t.attributes.name),m(d(),{className:"Button rightAligned",onclick:function(){s().modal.show(k,{code:t.attributes.code,title:t.attributes.name})}},s().translator.trans("mattoid-store.admin.settings.add-store-goods"))))))})),!this.loading&&0===this.goodsList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(d(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more"))))},i.hasMoreResults=function(){return this.moreResults},i.loadMore=function(){this.loading=!0,this.loadResults(this.goodsList.length)},i.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.goodsList,t.payload.data),this.loading=!1,m.redraw(),t},i.loadResults=function(t){return void 0===t&&(t=0),s().store.find("/store/goods",{filter:{},page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},o}(p());const S=flarum.core.compat.Component;var B=o.n(S),R=function(t){function o(){return t.apply(this,arguments)||this}e(o,t);var i=o.prototype;return i.oninit=function(s){t.prototype.oninit.call(this,s),this.type=this.attrs.title,this.storeData=this.attrs.storeData},i.className=function(){return"Modal--small"},i.title=function(){return s().translator.trans("mattoid-store.admin.settings.goods-item-"+this.type)},i.content=function(){var t=this;return m("div",{className:"Modal-body"},m("div",{className:"Form-group",style:"text-align: center;"},y().component({className:"Button Button--primary",type:"submit",loading:this.loading},s().translator.trans("mattoid-store.lib.confirm"))," ",y().component({className:"Button storeButton--gray",loading:this.loading,onclick:function(){t.hide()}},s().translator.trans("mattoid-store.lib.cancel"))))},i.onsubmit=function(t){var o=this;t.preventDefault(),this.loading=!0;var i=this.storeData.status;this.storeData.status=Number(!this.storeData.status);var a="delete"===this.type?"DELETE":"PUT";s().request({method:a,url:s().forum.attribute("apiUrl")+"/store/goods",body:this.storeData}).then((function(){return location.reload()}),(function(t){o.loading=!1,o.storeData.status=i,o.handleErrors(t)}))},o}(h()),L=function(t){function o(){for(var s,o=arguments.length,i=new Array(o),a=0;a<o;a++)i[a]=arguments[a];return(s=t.call.apply(t,[this].concat(i))||this).storeData={},s}e(o,t);var i=o.prototype;return i.oninit=function(s){t.prototype.oninit.call(this,s),this.storeData=this.attrs.item.attributes},i.view=function(){var t=this,o=(s().forum.attribute("antoinefr-money.moneyname")||"[money]").replace("[money]",this.storeData.price),i=this.storeData;return m("div",{id:this.storeData.id,className:"storeItemContainer"},m("div",{className:"leftAligned"},m("div",{className:"margin"},m("span",null,m(y(),{className:"Button Button--primary",onclick:function(){s().modal.show(k,{storeData:i})}},s().translator.trans("mattoid-store.admin.settings.goods-edit"))),m("span",{className:"margin"},m(y(),{className:"Button Button--danger",onclick:function(){s().modal.show(R,{storeData:i,title:"delete"})}},s().translator.trans("mattoid-store.admin.settings.goods-delete"))),m("span",{className:"margin"},m(y(),{className:"Button",onclick:function(){s().modal.show(R,{storeData:i,title:"status-"+t.storeData.status})}},0===this.storeData.status?s().translator.trans("mattoid-store.lib.item-status-1"):s().translator.trans("mattoid-store.lib.item-status-0")))),m("div",null,s().translator.trans("mattoid-store.lib.item-id"),": ",this.storeData.id," |  ",s().translator.trans("mattoid-store.lib.item-title"),": ",this.storeData.title),m("div",null,s().translator.trans("mattoid-store.lib.item-desc"),": ",this.storeData.desc),m("div",null,s().translator.trans("mattoid-store.lib.item-status"),": ",m("span",{className:0===this.storeData.status?"red":"green"},s().translator.trans("mattoid-store.lib.item-status-"+this.storeData.status))," | ",s().translator.trans("mattoid-store.lib.item-price"),": ",o," | ",s().translator.trans("mattoid-store.lib.item-stock"),": ",-99==this.storeData.stock?"无限":this.storeData.stock," | ",s().translator.trans("mattoid-store.lib.item-discount"),": ",this.storeData.discount?this.storeData.discount+" %":"无"," | ",s().translator.trans("mattoid-store.lib.item-discount_limit"),": ",this.storeData.discountLimit||0," ",{days:"天",hour:"小时",minute:"分钟",second:"秒"}[this.storeData.discountLimitUnit]),m("div",null,s().translator.trans("mattoid-store.lib.item-type"),": ",s().translator.trans("mattoid-store.lib.item-type-"+this.storeData.type)," | ",s().translator.trans("mattoid-store.lib.item-created-at"),": ",this.storeData.createdAt)),m("div",{className:"rightAligned icon-size"},m("img",{className:"icon-size",src:this.storeData.icon})))},o}(B()),O=function(t){function o(){for(var s,o=arguments.length,i=new Array(o),a=0;a<o;a++)i[a]=arguments[a];return(s=t.call.apply(t,[this].concat(i))||this).storeList=[],s.moreResults=!1,s}e(o,t);var i=o.prototype;return i.oninit=function(s){t.prototype.oninit.call(this,s),this.status=b()("-1"),this.type=b()("-1"),this.loadResults()},i.content=function(){var t=this;return m("div",{className:"ExtensionPage-body"},m("div",{className:"ExtensionPage-settings FlarumBadgesPage"},m("div",{className:"container"},m("form",null,this.buildSettingComponent({type:"string",setting:"mattoid-store.storeName",label:s().translator.trans("mattoid-store.admin.settings.store-name"),placeholder:s().translator.trans("mattoid-store.admin.settings.store-name"),help:s().translator.trans("mattoid-store.admin.settings.store-name-requirement")}),this.buildSettingComponent({type:"string",setting:"mattoid-store.storeTimezone",label:s().translator.trans("mattoid-store.admin.settings.store-timezone"),placeholder:"Asia/Shanghai",help:s().translator.trans("mattoid-store.admin.settings.store-timezone-requirement")}),this.submitButton()),m("hr",null),this.buildSettingComponent((function(){return m(".Form-group",d().component({className:"Button",onclick:function(){s().modal.show(D)}},s().translator.trans("mattoid-store.admin.settings.add-store-goods")))}))),m("div",{className:"container"},m("div",{className:"spacing",style:"overflow: auto"},m("div",{style:"display: inline-block;"},m(w(),{value:this.status(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-status-all"),1:s().translator.trans("mattoid-store.lib.item-status-up"),0:s().translator.trans("mattoid-store.lib.item-status-down")},buttonClassName:"Button",onchange:function(s){t.status(s),t.storeList=[],t.loadResults()}})),m("div",{style:" display: inline-block; margin-left: 26px;"},m(w(),{value:this.type(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-type-all"),permanent:s().translator.trans("mattoid-store.lib.item-type-permanent"),limit:s().translator.trans("mattoid-store.lib.item-type-limit")},buttonClassName:"Button",onchange:function(s){t.type(s),t.storeList=[],t.loadResults()}}))),m("ul",{style:"padding:0px;list-style-type: none;"},this.storeList.map((function(t){return m("li",{style:"margin-top:5px;background: var(--body-bg);"},L.component({item:t}))}))),!this.loading&&0===this.storeList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(d(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more"))))))},i.hasMoreResults=function(){return this.moreResults},i.loadMore=function(){this.loading=!0,this.loadResults(this.storeList.length)},i.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.storeList,t.payload.data),this.loading=!1,m.redraw(),t},i.loadResults=function(t){void 0===t&&(t=0);var o={type:this.type(),status:this.status()};return s().store.find("/store/list",{filter:o,page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},o}(r());s().initializers.add("mattoid-store",(function(){s().extensionData.for("mattoid-store").registerPage(O).registerPermission({icon:"fas fa-id-card",label:s().translator.trans("mattoid-store.admin.settings.group-view"),permission:"mattoid-store.group-view",allowGuest:!0},"view").registerPermission({icon:"fas fa-id-card",label:s().translator.trans("mattoid-store.admin.settings.group-view"),permission:"mattoid-store.group-moderate",allowGuest:!0},"moderate")}))})(),module.exports=i})();
//# sourceMappingURL=admin.js.map