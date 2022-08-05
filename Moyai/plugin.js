import {FluxDispatcher} from "@cumcord/modules/common";
import {getChannelId} from "@cumcord/modules/common/channels";
import {persist} from "@cumcord/pluginData";

const THUD_URL =
  "https://raw.githubusercontent.com/Metastruct/garrysmod-chatsounds/master/sound/chatsounds/autoadd/memes/overused%20thud.ogg";

const audio = {node: new Audio(THUD_URL)};

function playAudio() {
  if (audio.node.paused && !audio.locked) {
    audio.locked = true;
    audio.node.currentTime = 0;
    audio.node.volume = persist.ghost.volume || 0.5;
    audio.node.play().then(() => {
      audio.locked = false;
    });
  } else {
    let clone = audio.node.cloneNode();
    clone.currentTime = 0;
    clone.volume = persist.ghost.volume || 0.5;
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
}

function handleMessage(event) {
  if (
    event.message.content &&
    event.channelId === getChannelId() &&
    !event.message.state &&
    event.sendMessageOptions === undefined
  ) {
    let count = (event.message.content.match(/🗿/g) || []).length;
    count += (event.message.content.match(/<a?:.*?moy?ai.*?:.+?>/gi) || [])
      .length;

    if (persist.ghost.husk)
      count += (event.message.content.match(/<a?:.*?husk.*?:.+?>/gi) || [])
        .length;

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        setTimeout(playAudio, i * 350);
      }
    }
  }
}

function handleReaction(event) {
  if (
    persist.ghost.allowReactions &&
    event.channelId === getChannelId() &&
    (event.emoji.name === "🗿" ||
      event.emoji.name.match(/.*?moy?ai.*?/) ||
      (persist.ghost.husk && event.emoji.name.match(/.*?husk.*?/))) &&
    !event.optimistic
  ) playAudio();
}

export function onLoad() {
  FluxDispatcher.subscribe("MESSAGE_CREATE", handleMessage);
  FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", handleReaction);
}

export function onUnload() {
  FluxDispatcher.unsubscribe("MESSAGE_CREATE", handleMessage);
  FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", handleReaction);
}

export {default as settings} from "./Settings";