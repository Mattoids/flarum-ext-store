(()=>{var t={n:a=>{var e=a&&a.__esModule?()=>a.default:()=>a;return t.d(e,{a:e}),e},d:(a,e)=>{for(var o in e)t.o(e,o)&&!t.o(a,o)&&Object.defineProperty(a,o,{enumerable:!0,get:e[o]})},o:(t,a)=>Object.prototype.hasOwnProperty.call(t,a),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},a={};(()=>{"use strict";t.r(a);const e=flarum.core.compat["forum/app"];var o=t.n(e);const s=flarum.core.compat["common/extend"],r=flarum.core.compat["forum/components/IndexPage"];var n=t.n(r);const i=flarum.core.compat["common/components/LinkButton"];var l=t.n(i);const c=flarum.core.compat["forum/components/UserPage"];var u=t.n(c);function p(t,a){return p=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,a){return t.__proto__=a,t},p(t,a)}function d(t,a){t.prototype=Object.create(a.prototype),t.prototype.constructor=t,p(t,a)}const h=flarum.core.compat["common/helpers/listItems"];var f=t.n(h);const v=flarum.core.compat["common/components/Button"];var y=t.n(v);const g=flarum.core.compat["common/utils/Stream"];var b=t.n(g);const D=flarum.core.compat.Component;var N=t.n(D);const x=flarum.core.compat["common/components/Modal"];var w=t.n(x);const R=flarum.core.compat["common/components/Switch"];var P=t.n(R);const k=flarum.core.compat["common/components/Select"];var T=t.n(k),O=function(t){function a(){for(var a,e=arguments.length,o=new Array(e),s=0;s<e;s++)o[s]=arguments[s];return(a=t.call.apply(t,[this].concat(o))||this).storeData={},a.params={},a.range=!1,a}d(a,t),a.initAttrs=function(a){t.initAttrs.call(this,a)};var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.storeData=this.attrs.storeData,this.params.id=this.attrs.storeData.id},e.title=function(){return this.storeData.title},e.className=function(){return this.storeData.className},e.content=function(){return m(".Modal-body",[this.getHtml(JSON.parse(this.storeData.popUp)),m(".Form-group .center",[y().component({type:"submit",className:"Button Button--primary",loading:this.loading},app.translator.trans("mattoid-store.forum.button"))])])},e.getHtml=function(t){var a=this;return t.map((function(t){return a.getInput(t)}))},e.getInput=function(t){var a,e=this;switch(t.prop){case"input":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),m("input.FormControl",{type:t.type||"text",value:this.params[t.value],onchange:function(a){e.params[t.value]=a.target.value},min:0,step:.1,disabled:this.loading})]);break;case"switch":a=m(".Form-group",[P().component({state:this.range,onchange:function(a){e.range=a,e.params[t.value]=a},disabled:this.loading},app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText))]);break;case"select":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),T().component({value:this.params[t.value],disabled:this.loading,options:t.options,buttonClassName:"Button",onchange:function(a){e.params[t.value]=a}})]);break;case"textarea":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),m("textarea.FormControl",{value:this.params[t.value],onchange:function(a){e.params[t.value]=a.target.value}})])}return a},e.onsubmit=function(t){var a=this;t.preventDefault(),this.loading=!0,app.request({method:"POST",url:app.forum.attribute("apiUrl")+"/store/buy/goods",body:this.params}).then((function(){return location.reload()}),(function(t){a.loading=!1}))},a}(w()),S=function(t){function a(){for(var a,e=arguments.length,o=new Array(e),s=0;s<e;s++)o[s]=arguments[s];return(a=t.call.apply(t,[this].concat(o))||this).storeData={},a}d(a,t);var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.storeData=this.attrs.item.attributes,this.storeData.id=this.attrs.item.id},e.view=function(){var t=this,a=o().forum.attribute("antoinefr-money.moneyname")||"[money]",e=this.storeData.price>0?a.replace("[money]",this.storeData.price):o().translator.trans("mattoid-store.forum.free"),s=a.replace("[money]",this.storeData.discountPrice);return m("div",{id:this.storeData.id,onclick:function(){return t.showDetails(t.storeData)}},m("div",{className:"itemTitle"},this.storeData.title),m("div",{className:"price spacing"},this.storeData.discountPrice>0?m("div",null,m("span",{className:"price"},s)," ",m("span",{className:"discount"},e)):m("span",{className:"price"},e)),m("div",{className:"spacing"},o().translator.trans("mattoid-store.lib.item-stock"),": ",-99==this.storeData.stock?o().translator.trans("mattoid-store.forum.infinite"):this.storeData.stock," | ",o().translator.trans("mattoid-store.lib.item-type-"+this.storeData.type)," ",m("span",{style:"limit"===this.storeData.type?"display:inline-block":"display: none"},"(",this.storeData.outtime,o().translator.trans("mattoid-store.forum.days"),")"),m("span",{style:"limit"===this.storeData.type&&this.storeData.autoDeduction?"display:inline-block":"display: none"}," | ",o().translator.trans("mattoid-store.lib.item-invalid",{day:this.storeData.outtime}))),m("div",{className:"spacing"},m("div",{id:"box"},this.storeData.desc)),m("div",{className:"spacing center"},m("img",{className:"icon-size",src:this.storeData.icon})))},e.showDetails=function(t){o().session.user&&o().modal.show(O,{storeData:t})},a}(N()),B=function(t){function a(){for(var a,e=arguments.length,o=new Array(e),s=0;s<e;s++)o[s]=arguments[s];return(a=t.call.apply(t,[this].concat(o))||this).storeList=[],a.moreResults=!1,a}d(a,t);var e=a.prototype;return e.oncreate=function(a){t.prototype.oncreate.call(this,a),app.setTitle(app.forum.attribute("storeName")||app.translator.trans("mattoid-store.forum.tital")),app.setTitleCount(0),this.status=b()("1"),this.type=b()("-1"),this.loadResults()},e.view=function(){var t=this;return m("div",{className:"IndexPage"},m("div",{className:"container"},m("div",{className:"sideNavContainer"},m("nav",{className:"IndexPage-nav sideNav"},m("ul",null,f()(this.sidebarItems().toArray()))),m("div",{className:"StorePage-results sideNavOffset"},m("h2",{class:"BadgeOverviewTitle"},app.forum.attribute("storeName")||app.translator.trans("mattoid-store.forum.tital")),m("div",{className:"Store-Body"},this.storeList.map((function(t){if(!t.attributes.hide||app.session.user.attribute("can"+t.attributes.code.slice(0,1).toUpperCase()+t.attributes.code.slice(1)+"View"))return m("div",{className:"storeItemContainer"},S.component({item:t}))}))),!this.loading&&0===this.storeList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},app.translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(y(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},app.translator.trans("mattoid-store.lib.list-load-more")))))))},e.hasMoreResults=function(){return this.moreResults},e.loadMore=function(){this.loading=!0,this.loadResults(this.storeList.length)},e.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.storeList,t.payload.data),this.loading=!1,m.redraw(),t},e.loadResults=function(t){void 0===t&&(t=0);var a={type:this.type(),status:this.status()};return app.store.find("/store/list",{filter:a,page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},a}(n()),M=function(t){function a(){return t.apply(this,arguments)||this}d(a,t);var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a)},e.view=function(){},e.onsubmit=function(t){},a}(N());const I=flarum.core.compat["components/Button"];var L=t.n(I),C=function(t){function a(){for(var a,e=arguments.length,o=new Array(e),s=0;s<e;s++)o[s]=arguments[s];return(a=t.call.apply(t,[this].concat(o))||this).cartList=[],a.moreResults=!1,a}d(a,t);var e=a.prototype;return e.oncreate=function(a){t.prototype.oncreate.call(this,a),this.loadResults()},e.view=function(){var t=this;return m("div",{className:"Post-body"},m("h2",{class:"BadgeOverviewTitle"},o().translator.trans("mattoid-store-invite.forum.cart")),m("div",null,m("div",{className:"Invite-Input"},m(T(),{style:"width: 150px",value:this.status(),disabled:this.loading,options:{"-1":o().translator.trans("mattoid-store-invite.lib.item-status-all"),0:o().translator.trans("mattoid-store-invite.lib.item-status-confirm"),1:o().translator.trans("mattoid-store-invite.lib.item-status-adopt"),2:o().translator.trans("mattoid-store-invite.lib.item-status-refuse")},onchange:function(a){t.status(a),t.inviteList=[],t.loadResults()}})),m("div",null,this.cartList.map((function(t){M.component({item:t})})),!this.loading&&0===this.cartList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},o().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(L(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},o().translator.trans("mattoid-store.lib.list-load-more"))))))},e.hasMoreResults=function(){return this.moreResults},e.loadMore=function(){this.loading=!0,this.loadResults(this.cartList.length)},e.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.cartList,t.payload.data),this.loading=!1,m.redraw(),t},e.loadResults=function(t){return void 0===t&&(t=0),o().store.find("/store/cart/list",{filter:{},page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},a}(u());o().initializers.add("mattoid/store",(function(){o().routes.store={path:"/store",component:B},o().routes.myCartPage={path:"/u/:username/cart",component:C},(0,s.extend)(u().prototype,"navItems",(function(t){if(!o().session.user.attribute("canStoreView"))return!1;t.add("myCartPage",l().component({href:o().route("myCartPage",{username:this.user.slug()}),icon:"fas fa-check-square"},o().translator.trans("mattoid-store-invite.forum.cart")))})),(0,s.extend)(n().prototype,"navItems",(function(t){if(!o().session.user.attribute("canStoreView"))return!1;t.add("store",l().component({href:o().route("store"),icon:"fas fa-store"},o().forum.attribute("storeName")||o().translator.trans("mattoid-store.forum.tital")))}))}))})(),module.exports=a})();
//# sourceMappingURL=forum.js.map