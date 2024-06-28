/*! For license information please see admin.js.LICENSE.txt */
(()=>{var t={535:t=>{"use strict";var s=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;t.exports=function(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var s={},i=0;i<10;i++)s["_"+String.fromCharCode(i)]=i;if("0123456789"!==Object.getOwnPropertyNames(s).map((function(t){return s[t]})).join(""))return!1;var a={};return"abcdefghijklmnopqrst".split("").forEach((function(t){a[t]=t})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},a)).join("")}catch(t){return!1}}()?Object.assign:function(t,e){for(var o,n,r=function(t){if(null==t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}(t),l=1;l<arguments.length;l++){for(var m in o=Object(arguments[l]))i.call(o,m)&&(r[m]=o[m]);if(s){n=s(o);for(var d=0;d<n.length;d++)a.call(o,n[d])&&(r[n[d]]=o[n[d]])}}return r}},488:(t,s,i)=>{"use strict";var a=i(535),e="function"==typeof Symbol&&Symbol.for;e&&Symbol.for("react.element"),e&&Symbol.for("react.portal"),e&&Symbol.for("react.fragment"),e&&Symbol.for("react.strict_mode"),e&&Symbol.for("react.profiler"),e&&Symbol.for("react.provider"),e&&Symbol.for("react.context"),e&&Symbol.for("react.forward_ref"),e&&Symbol.for("react.suspense"),e&&Symbol.for("react.memo"),e&&Symbol.for("react.lazy"),"function"==typeof Symbol&&Symbol.iterator;function o(t){for(var s="https://reactjs.org/docs/error-decoder.html?invariant="+t,i=1;i<arguments.length;i++)s+="&args[]="+encodeURIComponent(arguments[i]);return"Minified React error #"+t+"; visit "+s+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var n={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},r={};function l(t,s,i){this.props=t,this.context=s,this.refs=r,this.updater=i||n}function m(){}function d(t,s,i){this.props=t,this.context=s,this.refs=r,this.updater=i||n}l.prototype.isReactComponent={},l.prototype.setState=function(t,s){if("object"!=typeof t&&"function"!=typeof t&&null!=t)throw Error(o(85));this.updater.enqueueSetState(this,t,s,"setState")},l.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")},m.prototype=l.prototype;var c=d.prototype=new m;c.constructor=d,a(c,l.prototype),c.isPureReactComponent=!0;Object.prototype.hasOwnProperty},684:(t,s,i)=>{"use strict";i(488)}},s={};function i(a){var e=s[a];if(void 0!==e)return e.exports;var o=s[a]={exports:{}};return t[a](o,o.exports,i),o.exports}i.n=t=>{var s=t&&t.__esModule?()=>t.default:()=>t;return i.d(s,{a:s}),s},i.d=(t,s)=>{for(var a in s)i.o(s,a)&&!i.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:s[a]})},i.o=(t,s)=>Object.prototype.hasOwnProperty.call(t,s),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var a={};(()=>{"use strict";i.r(a);const t=flarum.core.compat["admin/app"];var s=i.n(t);function e(t,s){return e=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,s){return t.__proto__=s,t},e(t,s)}function o(t,s){t.prototype=Object.create(s.prototype),t.prototype.constructor=t,e(t,s)}const n=flarum.core.compat["admin/components/ExtensionPage"];var r=i.n(n);const l=flarum.core.compat["common/components/Button"];var d=i.n(l);const c=flarum.core.compat["common/components/Modal"];var u=i.n(c);i(684);const p=flarum.core.compat["components/Modal"];var h=i.n(p);const y=flarum.core.compat["components/Button"];var f=i.n(y);const g=flarum.core.compat["common/utils/Stream"];var b=i.n(g);const v=flarum.core.compat["common/components/Switch"];var x=i.n(v);const N=flarum.core.compat["common/components/Select"];var D=i.n(N),w=function(t){function i(){for(var s,i=arguments.length,a=new Array(i),e=0;e<i;e++)a[e]=arguments[e];return(s=t.call.apply(t,[this].concat(a))||this).method="POST",s.params={status:b()(1),code:b()(),title:b()(),desc:b()(),price:b()(),stock:b()(),discount:b()(),discountLimit:b()(),discountLimitUnit:b()("day"),type:b()("permanent"),outtime:b()(0),icon:b()(),hide:b()(0)},s}o(i,t);var a=i.prototype;return a.oninit=function(s){t.prototype.oninit.call(this,s),this.method="POST",this.params.code=b()(this.attrs.code||""),this.params.title=b()(this.attrs.title||""),this.attrs.storeData&&(this.method="PUT",this.params.id=b()(this.attrs.storeData.id),this.params.status=b()(this.attrs.storeData.status),this.params.code=b()(this.attrs.storeData.code),this.params.title=b()(this.attrs.storeData.title),this.params.desc=b()(this.attrs.storeData.desc),this.params.price=b()(this.attrs.storeData.price),this.params.stock=b()(this.attrs.storeData.stock),this.params.discount=b()(this.attrs.storeData.discount),this.params.discountLimit=b()(this.attrs.storeData.discountLimit),this.params.discountLimitUnit=b()(this.attrs.storeData.discountLimitUnit),this.params.type=b()(this.attrs.storeData.type),this.params.outtime=b()(this.attrs.storeData.outtime),this.params.icon=b()(this.attrs.storeData.icon),this.params.hide=b()(this.attrs.storeData.hide))},a.className=function(){return""},a.title=function(){return this.params.title()},a.content=function(){var t=this;return m("div",{className:"Modal-body"},m("div",{className:"Form"},m("div",{className:"Form-group"},m("div",{style:"text-align: left;"},m("div",{class:"spacing",style:"display: flex; align-items: center;"},m("span",null,s().translator.trans("mattoid-store.admin.settings.commodity-status")),m("span",{style:"margin-left: 15px;"},m(x(),{state:this.params.status(),onchange:function(s){t.params.status=b()(s)}}," "))),m("div",{class:"spacing",style:"display: flex; align-items: center;"},m("span",null,s().translator.trans("mattoid-store.admin.settings.commodity-code")),m("span",{style:"font-weight: normal; cursor: pointer; border-bottom: 2px dotted; margin-left: 15px;"}," ",this.params.code()," ")),m("div",{class:"spacing",style:"align-items: center;"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.commodity-title")),m("input",{required:!0,class:"FormControl",type:"text",bidi:this.params.title})),m("div",{class:"spacing",style:"align-items: center;"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.commodity-desc")),m("textarea",{class:"FormControl",bidi:this.params.desc})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.commodity-price")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 195px; margin-left: 0px; display: inline-block;",bidi:this.params.price}),m("div",{style:"width: 60px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.commodity-stock")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 195px; margin-left: 0px; display: inline-block;",bidi:this.params.stock})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.commodity-discount")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 100px; margin-left: 0px; display: inline-block;",bidi:this.params.discount}),m("div",{style:"width: 60px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.commodity-discount-limit")),m("input",{required:!0,class:"FormControl",type:"number",step:"1",min:"0",style:"width: 145px; margin-left: 0px; display: inline-block;",bidi:this.params.discountLimit}),m("div",{style:"width: 40px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.commodity-discount-limit-unit")),D().component({options:{day:s().translator.trans("mattoid-store.lib.item-limit-unit-day"),hour:s().translator.trans("mattoid-store.lib.item-limit-unit-hour"),minute:s().translator.trans("mattoid-store.lib.item-limit-unit-minute"),second:s().translator.trans("mattoid-store.lib.item-limit-unit-second")},value:this.params.discountLimitUnit(),onchange:function(s){t.params.discountLimitUnit=b()(s)}})),m("div",{className:"spacing"},m("div",{style:"width: 60px; display: inline-block;"},s().translator.trans("mattoid-store.admin.settings.commodity-type")),D().component({options:{permanent:s().translator.trans("mattoid-store.lib.item-type-permanent"),limit:s().translator.trans("mattoid-store.lib.item-type-limit")},value:this.params.type(),onchange:function(s){t.params.type=b()(s)}}),m("div",{style:"limit"===this.params.type()?"display:inline-block":"display: none"},m("div",{style:"width: 80px; display: inline-block; margin-left: 26px;"},s().translator.trans("mattoid-store.admin.settings.commodity-outtime")),m("input",{required:!0,class:"FormControl",type:"number",style:"width: 200px; margin-left: 0px; display: inline-block;",bidi:this.params.outtime}),m("span",{style:"margin-left: 10px;"},"天"))),m("div",{className:"spacing"},m("div",{className:""},s().translator.trans("mattoid-store.admin.settings.commodity-icon")),m("div",{style:"position: relative;"},m("div",null,m("input",{id:"icon",required:!0,class:"FormControl",type:"text",bidi:this.params.icon})),m("div",{style:"margin-top: 5px;"},m(f(),{className:"Button Button--primary",onclick:function(){}},s().translator.trans("mattoid-store.admin.settings.commodity-upload-button"))))),m("div",{className:"spacing"},m(x(),{state:this.params.hide(),onchange:function(s){t.params.hide=b()(s)}},s().translator.trans("mattoid-store.admin.settings.commodity-hide")))),m("div",{className:"spacing center"},f().component({className:"Button Button--primary",type:"submit",loading:this.loading},s().translator.trans("mattoid-store.admin.settings.edit-store-commodity"))))))},a.onsubmit=function(t){var i=this;t.preventDefault(),this.loading=!0,s().request({method:this.method,url:s().forum.attribute("apiUrl")+"/store/commodity",body:this.params}).then((function(){return location.reload()}),(function(t){i.loading=!1,i.handleErrors(t)}))},i}(h()),S=function(t){function i(){for(var s,i=arguments.length,a=new Array(i),e=0;e<i;e++)a[e]=arguments[e];return(s=t.call.apply(t,[this].concat(a))||this).commodityList=[],s.moreResults=!1,s}o(i,t);var a=i.prototype;return a.oninit=function(s){t.prototype.oninit.call(this,s),this.loadResults()},a.title=function(){return s().translator.trans("mattoid-store.admin.settings.add-store-commodity")},a.className=function(){return""},a.content=function(){var t=this;return m("div",null,this.commodityList.map((function(t,i){return m("div",{className:"storeItemContainer",style:"margin: 10px"},m("div",{className:"ExtensionPage-body"},m("div",{className:"ExtensionPage-settings FlarumBadgesPage",style:"margin-top: 10px"},m("div",{className:"container"},m("span",{className:"leftAligned",style:"padding: 8px"},t.attributes.name),m(d(),{className:"Button rightAligned",onclick:function(){s().modal.show(w,{code:t.attributes.code,title:t.attributes.name})}},s().translator.trans("mattoid-store.admin.settings.add-store-commodity"))))))})),!this.loading&&0===this.commodityList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(d(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more"))))},a.hasMoreResults=function(){return this.moreResults},a.loadMore=function(){this.loading=!0,this.loadResults(this.commodityList.length)},a.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.commodityList,t.payload.data),this.loading=!1,m.redraw(),t},a.loadResults=function(t){return void 0===t&&(t=0),s().store.find("/store/commodity",{filter:{},page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},i}(u());const k=flarum.core.compat.Component;var O=i.n(k),R=function(t){function i(){return t.apply(this,arguments)||this}o(i,t);var a=i.prototype;return a.oninit=function(s){t.prototype.oninit.call(this,s),this.type=this.attrs.title,this.storeData=this.attrs.storeData},a.className=function(){return"Modal--small"},a.title=function(){return s().translator.trans("mattoid-store.admin.settings.commodity-item-"+this.type)},a.content=function(){var t=this;return m("div",{className:"Modal-body"},m("div",{className:"Form-group",style:"text-align: center;"},f().component({className:"Button Button--primary",type:"submit",loading:this.loading},s().translator.trans("mattoid-store.lib.confirm"))," ",f().component({className:"Button storeButton--gray",loading:this.loading,onclick:function(){t.hide()}},s().translator.trans("mattoid-store.lib.cancel"))))},a.onsubmit=function(t){var i=this;t.preventDefault(),this.loading=!0;var a=this.storeData.status;this.storeData.status=Number(!this.storeData.status);var e="delete"===this.type?"DELETE":"PUT";s().request({method:e,url:s().forum.attribute("apiUrl")+"/store/commodity",body:this.storeData}).then((function(){return location.reload()}),(function(t){i.loading=!1,i.storeData.status=a,i.handleErrors(t)}))},i}(h()),j=function(t){function i(){for(var s,i=arguments.length,a=new Array(i),e=0;e<i;e++)a[e]=arguments[e];return(s=t.call.apply(t,[this].concat(a))||this).storeData={},s}o(i,t);var a=i.prototype;return a.oninit=function(s){t.prototype.oninit.call(this,s),this.storeData=this.attrs.item.attributes},a.view=function(){var t=this,i=(s().forum.attribute("antoinefr-money.moneyname")||"[money]").replace("[money]",this.storeData.price),a=this.storeData;return m("div",{id:this.storeData.id,className:"storeItemContainer"},m("div",{className:"leftAligned"},m("div",{className:"margin"},m("span",null,m(f(),{className:"Button Button--primary",onclick:function(){s().modal.show(w,{storeData:a})}},s().translator.trans("mattoid-store.admin.settings.commodity-edit"))),m("span",{className:"margin"},m(f(),{className:"Button Button--danger",onclick:function(){s().modal.show(R,{storeData:a,title:"delete"})}},s().translator.trans("mattoid-store.admin.settings.commodity-delete"))),m("span",{className:"margin"},m(f(),{className:"Button",onclick:function(){s().modal.show(R,{storeData:a,title:"status-"+t.storeData.status})}},0===this.storeData.status?s().translator.trans("mattoid-store.lib.item-status-1"):s().translator.trans("mattoid-store.lib.item-status-0")))),m("div",null,s().translator.trans("mattoid-store.lib.item-id"),": ",this.storeData.id," |  ",s().translator.trans("mattoid-store.lib.item-title"),": ",this.storeData.title),m("div",null,s().translator.trans("mattoid-store.lib.item-desc"),": ",this.storeData.desc),m("div",null,s().translator.trans("mattoid-store.lib.item-status"),": ",m("span",{className:0===this.storeData.status?"red":"green"},s().translator.trans("mattoid-store.lib.item-status-"+this.storeData.status))," | ",s().translator.trans("mattoid-store.lib.item-price"),": ",i," | ",s().translator.trans("mattoid-store.lib.item-stock"),": ",this.storeData.stock," | ",s().translator.trans("mattoid-store.lib.item-discount"),": ",this.storeData.discount||"无"," | ",s().translator.trans("mattoid-store.lib.item-discount_limit"),": ",this.storeData.discountLimit||0," ",this.storeData.discountLimitUnitStr),m("div",null,s().translator.trans("mattoid-store.lib.item-type"),": ",s().translator.trans("mattoid-store.lib.item-type-"+this.storeData.type)," | ",s().translator.trans("mattoid-store.lib.item-created-at"),": ",this.storeData.createdAt)),m("div",{className:"rightAligned icon-size"},m("img",{src:this.storeData.icon})))},i}(O()),B=function(t){function i(){for(var s,i=arguments.length,a=new Array(i),e=0;e<i;e++)a[e]=arguments[e];return(s=t.call.apply(t,[this].concat(a))||this).storeList=[],s.moreResults=!1,s}o(i,t);var a=i.prototype;return a.oninit=function(s){t.prototype.oninit.call(this,s),this.status=b()("-1"),this.type=b()("-1"),this.loadResults()},a.content=function(){var t=this;return m("div",{className:"ExtensionPage-body"},m("div",{className:"ExtensionPage-settings FlarumBadgesPage"},m("div",{className:"container"},m("form",null,this.buildSettingComponent({type:"string",setting:"mattoid-store.storeName",label:s().translator.trans("mattoid-store.admin.settings.store-name"),placeholder:s().translator.trans("mattoid-store.admin.settings.store-name"),help:s().translator.trans("mattoid-store.admin.settings.store-name-requirement")}),this.buildSettingComponent({type:"string",setting:"mattoid-store.storeTimezone",label:s().translator.trans("mattoid-store.admin.settings.store-timezone"),placeholder:"Asia/Shanghai",help:s().translator.trans("mattoid-store.admin.settings.store-timezone-requirement")}),this.submitButton()),m("hr",null),this.buildSettingComponent((function(){return m(".Form-group",d().component({className:"Button",onclick:function(){s().modal.show(S)}},s().translator.trans("mattoid-store.admin.settings.add-store-commodity")))}))),m("div",{className:"container"},m("div",{className:"spacing",style:"overflow: auto"},m("div",{style:"display: inline-block;"},m(D(),{value:this.status(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-status-all"),1:s().translator.trans("mattoid-store.lib.item-status-up"),0:s().translator.trans("mattoid-store.lib.item-status-down")},buttonClassName:"Button",onchange:function(s){t.status(s),t.storeList=[],t.loadResults()}})),m("div",{style:" display: inline-block; margin-left: 26px;"},m(D(),{value:this.type(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-type-all"),permanent:s().translator.trans("mattoid-store.lib.item-type-permanent"),limit:s().translator.trans("mattoid-store.lib.item-type-limit")},buttonClassName:"Button",onchange:function(s){t.type(s),t.storeList=[],t.loadResults()}}))),m("ul",{style:"padding:0px;list-style-type: none;"},this.storeList.map((function(t){return m("li",{style:"margin-top:5px;background: var(--body-bg);"},j.component({item:t}))}))),!this.loading&&0===this.storeList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(d(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more"))))))},a.hasMoreResults=function(){return this.moreResults},a.loadMore=function(){this.loading=!0,this.loadResults(this.storeList.length)},a.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.storeList,t.payload.data),this.loading=!1,m.redraw(),t},a.loadResults=function(t){void 0===t&&(t=0);var i={type:this.type(),status:this.status()};return s().store.find("/store/list",{filter:i,page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},i}(r());s().initializers.add("mattoid-store",(function(){s().extensionData.for("mattoid-store").registerPage(B).registerPermission({icon:"fas fa-id-card",label:s().translator.trans("mattoid-store.admin.settings.group-view"),permission:"mattoid-store.group-view",allowGuest:!0},"view")}))})(),module.exports=a})();
//# sourceMappingURL=admin.js.map