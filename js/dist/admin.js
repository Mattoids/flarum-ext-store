(()=>{var t={n:e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},d:(e,r)=>{for(var o in r)t.o(r,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:r[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};(()=>{"use strict";t.r(e);const r=flarum.core.compat["admin/app"];var o=t.n(r);o().initializers.add("mattoid-store",(function(){o().extensionData.for("mattoid-store").registerSetting({setting:"mattoid-store.storeName",help:o().translator.trans("mattoid-store.admin.settings.store-name-requirement"),label:o().translator.trans("mattoid-store.admin.settings.store-name"),type:"string"}).registerSetting({setting:"mattoid-store.decorationStoreTimezone",help:o().translator.trans("mattoid-store.admin.settings.decorationStoreTimezone-requirement"),label:o().translator.trans("mattoid-store.admin.settings.decorationStoreTimezone"),type:"string"}).registerPermission({icon:"fas fa-id-card",label:o().translator.trans("mattoid-store.admin.settings.group-view"),permission:"mattoid-store.group-view",allowGuest:!0},"view")}))})(),module.exports=e})();
//# sourceMappingURL=admin.js.map