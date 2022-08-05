(function(c,i,l,u){"use strict";function d(t){if(t&&t.__esModule)return t;var n=Object.create(null);return t&&Object.keys(t).forEach(function(e){if(e!=="default"){var r=Object.getOwnPropertyDescriptor(t,e);Object.defineProperty(n,e,r.get?r:{enumerable:!0,get:function(){return t[e]}})}}),n.default=t,Object.freeze(n)}var s=d(i);const o=l.findByProps("parseEmbedTitle"),f=`.theme-dark .greentext {
  color: #afc960;
}
.theme-light .greentext {
  color: #789922;
}`;let a;function p(){u.injectCSS(f),a=u.instead("parse",o,function(t){return o.reactParserFor(Object.assign({greentext:{order:o.defaultRules.text.order,match:function(n,e){return e.inGreentext||e.inQuote?null:/^$|\n$/.test(e.prevCapture!=null?e.prevCapture[0]:"")&&/^(>.+?)(?:\n|$)/.exec(n)},parse:function(n,e,r){r.inGreentext=!0;const b={content:e(n[0],r),type:"greentext"};return delete r.inGreentext,b},react:function(n,e,r){return s.createElement("span",{className:"greentext"},e(n.content,r))}}},o.defaultRules)).apply(this,t)})}const m=()=>a?.();return c.onLoad=p,c.onUnload=m,Object.defineProperty(c,"__esModule",{value:!0}),c})({},cumcord.modules.common.React,cumcord.modules.webpack,cumcord.patcher);
