(function(n,t,c){"use strict";const l=t.find(o=>o?.type?.displayName==="MessageContent"),a=t.findByProps("getChannel","getDMUserIds"),u=t.findByProps("getMember"),g=t.findByProps("MessageDisplayCompact"),f=t.findByProps("fromRatio");let r;function p(){r=c.after("type",l,function([{message:o}],e){if(o.author?.id==="1"||!e.props)return;const s=a.getChannel(o.channel_id)?.guild_id,i=s?u.getMember(s,o.author.id):null;if(!i?.colorString)return;const h=g.ThemeDoNotUseYet.getSetting(),d=f(i.colorString),m=h==="dark"?d.brighten(30):d.darken(10);e.props.style??={},e.props.style.color=m.toHslString()})}const y=()=>r();return n.onLoad=p,n.onUnload=y,Object.defineProperty(n,"__esModule",{value:!0}),n})({},cumcord.modules.webpack,cumcord.patcher);
