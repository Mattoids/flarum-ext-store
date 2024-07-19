(()=>{var t={n:a=>{var e=a&&a.__esModule?()=>a.default:()=>a;return t.d(e,{a:e}),e},d:(a,e)=>{for(var s in e)t.o(e,s)&&!t.o(a,s)&&Object.defineProperty(a,s,{enumerable:!0,get:e[s]})},o:(t,a)=>Object.prototype.hasOwnProperty.call(t,a),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},a={};(()=>{"use strict";t.r(a);const e=flarum.core.compat["forum/app"];var s=t.n(e);const o=flarum.core.compat["common/extend"],r=flarum.core.compat["forum/components/IndexPage"];var n=t.n(r);const i=flarum.core.compat["common/components/LinkButton"];var l=t.n(i);const c=flarum.core.compat["forum/components/UserPage"];var u=t.n(c);function p(t,a){return p=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,a){return t.__proto__=a,t},p(t,a)}function d(t,a){t.prototype=Object.create(a.prototype),t.prototype.constructor=t,p(t,a)}const h=flarum.core.compat["common/helpers/listItems"];var f=t.n(h);const v=flarum.core.compat["common/components/Button"];var y=t.n(v);const b=flarum.core.compat["common/utils/Stream"];var g=t.n(b);const D=flarum.core.compat.Component;var N=t.n(D);const x=flarum.core.compat["common/components/Modal"];var w=t.n(x);const R=flarum.core.compat["common/components/Switch"];var L=t.n(R);const P=flarum.core.compat["common/components/Select"];var C=t.n(P),T=function(t){function a(){for(var a,e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];return(a=t.call.apply(t,[this].concat(s))||this).storeData={},a.params={},a.range=!1,a}d(a,t),a.initAttrs=function(a){t.initAttrs.call(this,a)};var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.storeData=this.attrs.storeData,this.params.id=this.attrs.storeData.id},e.title=function(){return this.storeData.title},e.className=function(){return this.storeData.className},e.content=function(){return m(".Modal-body",[this.getHtml(JSON.parse(this.storeData.popUp)),m(".Form-group .center",[y().component({type:"submit",className:"Button Button--primary",loading:this.loading},app.translator.trans("mattoid-store.forum.button"))])])},e.getHtml=function(t){var a=this;return t.map((function(t){return a.getInput(t)}))},e.getInput=function(t){var a,e=this;switch(t.prop){case"input":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),m("input.FormControl",{type:t.type||"text",value:this.params[t.value],onchange:function(a){e.params[t.value]=a.target.value},min:0,step:.1,disabled:this.loading})]);break;case"switch":a=m(".Form-group",[L().component({state:this.range,onchange:function(a){e.range=a,e.params[t.value]=a},disabled:this.loading},app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText))]);break;case"select":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),C().component({value:this.params[t.value],disabled:this.loading,options:t.options,buttonClassName:"Button",onchange:function(a){e.params[t.value]=a}})]);break;case"textarea":a=m(".Form-group",[m("label",app.translator.trans(t.label)),m(".helpText",app.translator.trans(t.helpText)),m("textarea.FormControl",{value:this.params[t.value],onchange:function(a){e.params[t.value]=a.target.value}})])}return a},e.onsubmit=function(t){var a=this;t.preventDefault(),this.loading=!0,app.request({method:"POST",url:app.forum.attribute("apiUrl")+"/store/buy/goods",body:this.params}).then((function(){return location.reload()}),(function(t){a.loading=!1}))},a}(w()),k=function(t){function a(){for(var a,e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];return(a=t.call.apply(t,[this].concat(s))||this).storeData={},a}d(a,t);var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.storeData=this.attrs.item.attributes,this.storeData.id=this.attrs.item.id},e.view=function(){var t=this,a=s().forum.attribute("antoinefr-money.moneyname")||"[money]",e=this.storeData.price>0?a.replace("[money]",this.storeData.price):s().translator.trans("mattoid-store.forum.free"),o=a.replace("[money]",this.storeData.discountPrice);return m("div",{id:this.storeData.id,onclick:function(){return t.showDetails(t.storeData)}},m("div",{className:"itemTitle"},this.storeData.title),m("div",{className:"price spacing"},this.storeData.discountPrice>0?m("div",null,m("span",{className:"price"},o)," ",m("span",{className:"discount"},e)):m("span",{className:"price"},e)),m("div",{className:"spacing"},s().translator.trans("mattoid-store.lib.item-stock"),": ",-99==this.storeData.stock?s().translator.trans("mattoid-store.forum.infinite"):this.storeData.stock," | ",s().translator.trans("mattoid-store.lib.item-type-"+this.storeData.type)," ",m("span",{style:"limit"===this.storeData.type?"display:inline-block":"display: none"},"(",this.storeData.outtime,s().translator.trans("mattoid-store.forum.days"),")"),m("span",{style:"limit"===this.storeData.type&&this.storeData.autoDeduction?"display:inline-block":"display: none"}," | ",s().translator.trans("mattoid-store.lib.item-invalid",{day:this.storeData.outtime}))),m("div",{className:"spacing"},m("div",{id:"box"},this.storeData.desc)),m("div",{className:"spacing center"},m("img",{className:"icon-size",src:this.storeData.icon})))},e.showDetails=function(t){s().session.user&&s().modal.show(T,{storeData:t})},a}(N()),I=function(t){function a(){for(var a,e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];return(a=t.call.apply(t,[this].concat(s))||this).storeList=[],a.moreResults=!1,a}d(a,t);var e=a.prototype;return e.oncreate=function(a){t.prototype.oncreate.call(this,a),app.setTitle(app.forum.attribute("storeName")||app.translator.trans("mattoid-store.forum.tital")),app.setTitleCount(0),this.status=g()("1"),this.type=g()("-1"),this.loadResults()},e.view=function(){var t=this;return m("div",{className:"IndexPage"},m("div",{className:"container"},m("div",{className:"sideNavContainer"},m("nav",{className:"IndexPage-nav sideNav"},m("ul",null,f()(this.sidebarItems().toArray()))),m("div",{className:"StorePage-results sideNavOffset"},m("h2",{class:"BadgeOverviewTitle"},app.forum.attribute("storeName")||app.translator.trans("mattoid-store.forum.tital")),m("div",{className:"Store-Body"},this.storeList.map((function(t){if(!t.attributes.hide||app.session.user.attribute("can"+t.attributes.code.slice(0,1).toUpperCase()+t.attributes.code.slice(1)+"View"))return m("div",{className:"storeItemContainer"},k.component({item:t}))}))),!this.loading&&0===this.storeList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},app.translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(y(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},app.translator.trans("mattoid-store.lib.list-load-more")))))))},e.hasMoreResults=function(){return this.moreResults},e.loadMore=function(){this.loading=!0,this.loadResults(this.storeList.length)},e.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.storeList,t.payload.data),this.loading=!1,m.redraw(),t},e.loadResults=function(t){void 0===t&&(t=0);var a={type:this.type(),status:this.status()};return app.store.find("/store/list",{filter:a,page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},a}(n()),O=function(t){function a(){for(var a,e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];return(a=t.call.apply(t,[this].concat(s))||this).cartData={},a.params={},a}d(a,t);var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.cartData=this.attrs.item.attributes,this.params.id=this.attrs.item.id},e.view=function(){var t=this,a={0:{class:"",value:"未支付"},1:{class:"color-green",value:"已支付"},2:{class:"color-red",value:"已失效"},9:{class:"color-coral",value:"超时失效"}},e=s().forum.attribute("antoinefr-money.moneyname")||"[money]",o=this.cartData.price>0?e.replace("[money]",this.cartData.price):s().translator.trans("mattoid-store.forum.free"),r=this.cartData.payAmt>0?e.replace("[money]",this.cartData.payAmt):s().translator.trans("mattoid-store.forum.free");return m("div",{className:"frame"},m("div",{className:"row margin-top-10"},m("div",{className:"col-md-10"},m("div",null,m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-title"),": ")," ",m("span",{className:"color-green"},this.cartData.title),"  | ",m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-pay-amt"),": ")," ",m("span",{className:"color-red"},r),"  | ",m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-price"),": ")," ",m("span",{className:""},o)),m("div",null,m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-status"),": "),m("span",{className:a[this.cartData.status].class},a[this.cartData.status].value),"  | ",m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-type"),": ")," ",m("span",{className:(this.cartData.type,"")},"limit"==this.cartData.type?"限时有效":"永久有效"),"  | ","limit"==this.cartData.type?m("span",null,m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-outtime"),": "),m("span",null,this.cartData.outtime)):""),m("div",null,m("label",{className:"Cart-Label"},s().translator.trans("mattoid-store.lib.item-cart-auto-deduction"),": ")," ",m("span",{className:0==this.cartData.autoDeduction?"color-red":"color-green"},0==this.cartData.autoDeduction?"否":"是"))),m("div",{className:"col-md-2",style:"height: 71px;line-height: 71px;"},1==this.cartData.enableType?y().component({type:"submit",className:"Button Button--primary margin-left-30",loading:this.loading,onclick:function(a){t.onsubmit(a)}},s().translator.trans(0==this.cartData.enable?"mattoid-store.lib.item-cart-button-use":"mattoid-store.lib.item-cart-button-cancel")):"")))},e.onsubmit=function(t){var a=this;t.preventDefault(),this.loading=!0,s().request({method:"POST",url:s().forum.attribute("apiUrl")+"/store/use/goods",body:this.params}).then((function(){return location.reload()}),(function(t){a.loading=!1}))},a}(N());const B=flarum.core.compat["components/Button"];var S=t.n(B),M=function(t){function a(){for(var a,e=arguments.length,s=new Array(e),o=0;o<e;o++)s[o]=arguments[o];return(a=t.call.apply(t,[this].concat(s))||this).type=g()(""),a.status=g()("-1"),a.autoDeduction=g()("-1"),a.cartList=[],a.moreResults=!1,a}d(a,t);var e=a.prototype;return e.oninit=function(a){t.prototype.oninit.call(this,a),this.loadUser(m.route.param("username")),this.loadResults()},e.content=function(){var t=this;return m("div",{className:"Post-body"},m("h2",{class:"BadgeOverviewTitle"},s().translator.trans("mattoid-store.forum.cart")),m("div",null,m("div",{className:"Invite-Input"},m(C(),{style:"width: 150px",value:this.status(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-cart-status-all"),0:s().translator.trans("mattoid-store.lib.item-cart-status-0"),1:s().translator.trans("mattoid-store.lib.item-cart-status-1"),2:s().translator.trans("mattoid-store.lib.item-cart-status-2")},onchange:function(a){t.status(a),t.cartList=[],t.loadResults()}})),m("div",{className:"Invite-Input"},m(C(),{style:"width: 150px",value:this.type(),disabled:this.loading,options:{"":s().translator.trans("mattoid-store.lib.item-cart-type-all"),permanent:s().translator.trans("mattoid-store.lib.item-cart-type-permanent"),limit:s().translator.trans("mattoid-store.lib.item-cart-type-limit")},onchange:function(a){t.type(a),t.cartList=[],t.loadResults()}})),m("div",{className:"Invite-Input"},m(C(),{style:"width: 150px",value:this.autoDeduction(),disabled:this.loading,options:{"-1":s().translator.trans("mattoid-store.lib.item-cart-auto-deduction-all"),0:s().translator.trans("mattoid-store.lib.item-cart-auto-deduction-0"),1:s().translator.trans("mattoid-store.lib.item-cart-auto-deduction-1")},onchange:function(a){t.autoDeduction(a),t.cartList=[],t.loadResults()}}))),m("div",null,this.cartList.map((function(t){return m("div",{className:""},O.component({item:t}))})),!this.loading&&0===this.cartList.length&&m("div",null,m("div",{style:"font-size:1.4em;color: var(--muted-more-color);text-align: center;line-height: 100px;"},s().translator.trans("mattoid-store.lib.list-empty"))),!this.loading&&this.hasMoreResults()&&m("div",{style:"text-align:center;padding:20px"},m(S(),{className:"Button Button--primary",disabled:this.loading,loading:this.loading,onclick:function(){return t.loadMore()}},s().translator.trans("mattoid-store.lib.list-load-more")))))},e.hasMoreResults=function(){return this.moreResults},e.loadMore=function(){this.loading=!0,this.loadResults(this.cartList.length)},e.parseResults=function(t){return this.moreResults=!!t.payload.links&&!!t.payload.links.next,[].push.apply(this.cartList,t.payload.data),this.loading=!1,m.redraw(),t},e.loadResults=function(t){void 0===t&&(t=0);var a={type:this.type(),status:this.status(),autoDeduction:this.autoDeduction()};return s().store.find("/store/cart/list",{filter:a,page:{offset:t}}).catch((function(){})).then(this.parseResults.bind(this))},a}(u());s().initializers.add("mattoid/store",(function(){s().routes.store={path:"/store",component:I},s().routes.myCartPage={path:"/u/:username/cart",component:M},(0,o.extend)(u().prototype,"navItems",(function(t){if(!s().session.user.attribute("canStoreView"))return!1;t.add("myCartPage",l().component({href:s().route("myCartPage",{username:this.user.slug()}),icon:"fas fa-shopify"},s().translator.trans("mattoid-store.forum.cart")))})),(0,o.extend)(n().prototype,"navItems",(function(t){if(!s().session.user.attribute("canStoreView"))return!1;t.add("store",l().component({href:s().route("store"),icon:"fas fa-store"},s().forum.attribute("storeName")||s().translator.trans("mattoid-store.forum.tital")))}))}))})(),module.exports=a})();
//# sourceMappingURL=forum.js.map