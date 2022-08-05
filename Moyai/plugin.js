import {FluxDispatcher} from "@cumcord/modules/common";
import {getChannelId} from "@cumcord/modules/common/channels";

import Settings from "./Settings";

const THUD_URL =
  "https://raw.githubusercontent.com/Metastruct/garrysmod-chatsounds/master/sound/chatsounds/autoadd/memes/overused%20thud.ogg";

const audio = {node: new Audio(THUD_URL)};

export default (data) => {
  return {
    onLoad() {
      this.messageEvent = this.handleMessage.bind(this);
      this.reactionEvent = this.handleReaction.bind(this);

      FluxDispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
      FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", this.reactionEvent);
    },
    onUnload() {
      FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.messageEvent);
      FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", this.reactionEvent);
    },
    settings: Settings,

    playAudio() {
      if (audio.node.paused && !audio.locked) {
        audio.locked = true;
        audio.node.currentTime = 0;
        audio.node.volume = data.persist.ghost.volume || 0.5;
        audio.node.play().then(() => {
          audio.locked = false;
        });
      } else {
        let clone = audio.node.cloneNode();
        clone.currentTime = 0;
        clone.volume = data.persist.ghost.volume || 0.5;
        clone.play();
        clone.addEventListener(
          "ended",
          () => {
            clone.src = "";
            clone = null;
          },
          {once: true}
        );
      }
    },
    handleMessage(event) {
      if (
        event.message.content &&
        event.channelId === getChannelId() &&
        !event.message.state &&
        event.sendMessageOptions === undefined
      ) {
        let count = (event.message.content.match(/🗿/g) || []).length;
        count += (event.message.content.match(/<a?:.*?moy?ai.*?:.+?>/gi) || [])
          .length;

        if (data.persist.ghost.husk)
          count += (event.message.content.match(/<a?:.*?husk.*?:.+?>/gi) || [])
            .length;

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            setTimeout(this.playAudio.bind(this), i * 350);
          }
        }
      }
    },
    handleReaction(event) {
      if (
        data.persist.ghost.allowReactions &&
        event.channelId === getChannelId() &&
        (event.emoji.name === "🗿" ||
          event.emoji.name.match(/.*?moy?ai.*?/) ||
          (data.persist.ghost.husk && event.emoji.name.match(/.*?husk.*?/))) &&
        !event.optimistic
      ) {
        this.playAudio();
      }
    },
  };
};
