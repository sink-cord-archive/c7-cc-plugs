(function(n,t,c){"use strict";const l=t.find(o=>o?.type?.displayName==="MessageContent"),a=t.findByProps("getChannel","getDMUserIds"),u=t.findByProps("getMember"),g=t.findByProps("MessageDisplayCompact"),f=t.findByProps("fromRatio");let e;function y(){e=c.after("type",l,function([{message:o}],r){if(o.author?.id!=="1"){const s=a.getChannel(o.channel_id)?.guild_id,i=s?u.getMember(s,o.author.id):null;if(!i?.colorString)return;const m=g.ThemeDoNotUseYet.getSetting(),d=f(i.colorString),p=m==="dark"?d.brighten(30):d.darken(10);r.props.style??={},r.props.style.color=p.toHslString()}})}const h=()=>e();return n.onLoad=y,n.onUnload=h,Object.defineProperty(n,"__esModule",{value:!0}),n})({},cumcord.modules.webpack,cumcord.patcher);
