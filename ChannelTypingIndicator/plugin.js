import {
  find,
  findByProps,
  findByDisplayName,
} from "@cumcord/modules/webpackModules";
import {findInReactTree} from "@cumcord/utils";
import {after} from "@cumcord/patcher";
import {React, FluxDispatcher} from "@cumcord/modules/common";

const TypingClasses = findByProps("typing", "ellipsis");
const AnimatedSVG = findByProps("AnimatedDots", "default").default;
const ChannelItem = findByDisplayName("ChannelItem", false);

const typingUsers = {};
const listeners = new Set();

function eventListener(event) {
  if (event.type == "TYPING_START") {
    if (!typingUsers[event.channelId]) typingUsers[event.channelId] = new Set();
    typingUsers[event.channelId].add(event.userId);
  } else if (typingUsers[event.channelId]) {
    typingUsers[event.channelId].delete(
      event.message ? event.message.author.id : event.userId
    );
  }

  for (const {update, channelId} of listeners) {
    if (channelId == event.channelId) update();
  }
}

function TypingIndicator({channel, muted}) {
  const [isTyping, setTyping] = React.useState(!!typingUsers[channel.id]?.size);

  React.useEffect(() => {
    function update() {
      setTyping(typingUsers[channel.id]?.size);
    }
    const listener = {
      update,
      channelId: channel.id,
    };
    listeners.add(listener);
    update();

    return () => {
      listeners.delete(listener);
    };
  }, [channel.id]);

  return !isTyping || muted
    ? null
    : React.createElement(
        "div",
        {
          style: {
            marginLeft: "6px",
            paddingBottom: "3px",
          },
        },
        React.createElement(AnimatedSVG, {
          className: TypingClasses.ellipsis,
          dotRadius: 3.5,
          themed: true,
        })
      );
}

let unpatch;

export default (data) => {
  return {
    onLoad() {
      FluxDispatcher.subscribe("TYPING_START", eventListener);
      FluxDispatcher.subscribe("TYPING_STOP", eventListener);
      FluxDispatcher.subscribe("MESSAGE_CREATE", eventListener);

      unpatch = after("default", ChannelItem, function ([props], ret) {
        const container = findInReactTree(ret, (x) =>
          x?.className?.startsWith("children-")
        );
        if (container)
          container.children.push(
            React.createElement(TypingIndicator, {
              channel: props.channel,
              muted: props.muted,
            })
          );
      });
    },
    onUnload() {
      FluxDispatcher.unsubscribe("TYPING_START", eventListener);
      FluxDispatcher.unsubscribe("TYPING_STOP", eventListener);
      FluxDispatcher.unsubscribe("MESSAGE_CREATE", eventListener);

      unpatch();
    },
  };
};
