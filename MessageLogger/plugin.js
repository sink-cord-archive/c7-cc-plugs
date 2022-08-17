(function(r,_,i,a,o){"use strict";function E(t){if(t&&t.__esModule)return t;var s=Object.create(null);return t&&Object.keys(t).forEach(function(e){if(e!=="default"){var n=Object.getOwnPropertyDescriptor(t,e);Object.defineProperty(s,e,n.get?n:{enumerable:!0,get:function(){return t[e]}})}}),s.default=t,Object.freeze(s)}var l=E(_);const f=i.find(t=>t?.type?.displayName==="MessageContent"),c=i.findByProps("_channelMessages"),p=i.findByProps("getChannel","getDMUserIds"),u=i.findByProps("updateMessageRecord","createMessageRecord"),g=i.find(t=>t?.default?.prototype?.isEdited),M=i.findByDisplayName("MessageTimestamp"),y=i.findByProps("parseEmbedTitle"),h=i.findByProps("messageContent","botTag"),S=i.findByProps("markup","timestamp"),d=[];function D(t){if(t.type=="MESSAGE_DELETE"){if(t.__messageLogger)return t;const s=c.get(t.channelId);if(!s)return t;const e=s.get(t.id);return!e||e.author?.id=="1"||e.state=="SEND_FAILED"?t:(setTimeout(()=>{o.FluxDispatcher.dispatch({message:{...e.toJS(),id:e.id,channel_id:e.channel_id,guild_id:p.getChannel(e.channel_id).guild_id,deleted:!0},type:"MESSAGE_UPDATE"})}),null)}else if(t.type=="MESSAGE_UPDATE"){if(t?.message?.deleted)return t;if(t?.message?.edited_timestamp){const e=c.get(t.message.channel_id)?.get(t.message.id);e&&(t.message.edits=e.edits||[],t.message.edits.push({content:e.content,timestamp:e.editedTimestamp||e.timestamp,original:e.editedTimestamp==null}))}}return t}const C=`.ml-deleted {
  color: #f04747;
}

.ml-deleted-suffix {
  font-size: 0.75rem;
  line-height: 1.375rem;
  cursor: pointer;
}

.ml-edit {
  opacity: 0.5;
}`;function T(){a.injectCSS(C),d.push(a.instead("dispatch",o.FluxDispatcher,function([s],e){s=D(s),s&&e.apply(this,[s])})),d.push(a.instead("updateMessageRecord",u,function([s,e],n){return e.deleted?u.createMessageRecord(e,s.reactions):n.apply(this,[s,e])})),d.push(a.after("createMessageRecord",u,function([s],e){e.edits=s.edits,e.deleted=s.deleted})),d.push(a.after("compare",f,function([s,e],n){return n&&s.message.edits===e.message.edits&&s.message.deleted===e.message.deleted}));const t=g.default.prototype;d.push(a.after("default",g,function([s],e){return e.deleted=!!s.deleted,e.edits=s.edits,e.prototype=t,e.__proto__=t,e})),d.push(a.after("type",f,function([{message:s}],e){const n=(s.edits??[]).map(m=>l.createElement("div",{className:[S.markup,h.messageContent,"ml-edit"].join(" ")},y.parse(m.content)," ",l.createElement(M,{timestamp:m.timestamp,isEdited:!0,isInline:!0},l.createElement("span",{className:h.edited},"(",m.original?"original":"past edit",")"))));return s.deleted&&(e.props.className+=" ml-deleted",e.props.children.push(l.createElement("span",{className:"ml-deleted-suffix"}," (deleted)"))),n.length>0?[...n,e]:e}))}function P(){for(const t in c._channelMessages){const s=c._channelMessages[t]._array;for(const e of s)if(e.deleted&&o.FluxDispatcher.dispatch({type:"MESSAGE_DELETE",channelId:e.channel_id,id:e.id,__messageLogger:!0}),e.edits){const n=e.toJS();delete n.edits,o.FluxDispatcher.dispatch({message:{...n,id:e.id,channel_id:e.channel_id,guild_id:p.getChannel(e.channel_id).guild_id},type:"MESSAGE_UPDATE"})}}for(const t of d)t()}return r.onLoad=T,r.onUnload=P,Object.defineProperty(r,"__esModule",{value:!0}),r})({},cumcord.modules.common.React,cumcord.modules.webpack,cumcord.patcher,cumcord.modules.common);