import {findByProps, find, findByDisplayName} from "@cumcord/modules/webpack";
import {instead, after, injectCSS} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

const MessageContent = find((x) => x?.type?.displayName == "MessageContent");

const {Dispatcher} = findByProps("Dispatcher");
const DispatcherImpl = findByProps("_lastID");

const ChannelMessages = findByProps("_channelMessages");
const ChannelStore = findByProps("getChannel", "getDMUserIds");

const MessageRecord = findByProps("updateMessageRecord", "createMessageRecord");

const Message = find((x) => x?.default?.prototype?.isEdited);

const MessageTimestamp = findByDisplayName("MessageTimestamp");
const SimpleMarkdown = findByProps("parseEmbedTitle");

const MessageClasses = findByProps("messageContent", "botTag");
const MarkupClasses = findByProps("markup", "timestamp");

const patches = [];

function interceptEvent(event) {
  if (event.type == "MESSAGE_DELETE") {
    if (event.__messageLogger) return event;

    const messages = ChannelMessages.get(event.channelId);
    if (!messages) return event;

    const message = messages.get(event.id);
    if (!message) return event;

    if (message.author?.id == "1") return event;
    if (message.state == "SEND_FAILED") return event;

    setTimeout(() => {
      DispatcherImpl.dirtyDispatch({
        message: {
          ...message.toJS(),
          id: message.id,
          channel_id: message.channel_id,
          guild_id: ChannelStore.getChannel(message.channel_id).guild_id,
          deleted: true,
        },
        type: "MESSAGE_UPDATE",
      });
    });

    return null;
  } else if (event.type == "MESSAGE_UPDATE") {
    if (event?.message?.deleted) return event;

    if (event?.message?.edited_timestamp) {
      const messages = ChannelMessages.get(event.message.channel_id);
      const oldMessage = messages?.get(event.message.id);

      if (oldMessage) {
        event.message.edits = oldMessage.edits || [];
        event.message.edits.push({
          content: oldMessage.content,
          timestamp: oldMessage.editedTimestamp || oldMessage.timestamp,
          original: oldMessage.editedTimestamp == null,
        });
      }
    }
  }

  return event;
}

const css = `.ml-deleted {
  color: #f04747;
}

.ml-deleted-suffix {
  font-size: 0.75rem;
  line-height: 1.375rem;
  cursor: pointer;
}

.ml-edit {
  opacity: 0.5;
}`;

export default () => {
  return {
    onLoad() {
      injectCSS(css);

      // stackable, feel free to use in your own plugins
      patches.push(
        instead("dispatch", Dispatcher.prototype, function ([event], orig) {
          event = interceptEvent(event);

          if (event) {
            orig.apply(this, [event]);
          }
        })
      );

      patches.push(
        instead(
          "updateMessageRecord",
          MessageRecord,
          function ([oldRecord, newRecord], orig) {
            if (newRecord.deleted) {
              return MessageRecord.createMessageRecord(
                newRecord,
                oldRecord.reactions
              );
            }

            return orig.apply(this, [oldRecord, newRecord]);
          }
        )
      );

      patches.push(
        after(
          "createMessageRecord",
          MessageRecord,
          function ([message], record) {
            record.edits = message.edits;
            record.deleted = message.deleted;
          }
        )
      );

      patches.push(
        after(
          "compare",
          MessageContent,
          function ([oldProps, newProps], shouldUpdate) {
            return (
              shouldUpdate &&
              oldProps.message.edits === newProps.message.edits &&
              oldProps.message.deleted === newProps.message.deleted
            );
          }
        )
      );

      const MessageProto = Message.default.prototype;
      patches.push(
        after("default", Message, function ([props], message) {
          message.deleted = !!props.deleted;
          message.edits = props.edits;

          message.prototype = MessageProto;
          message.__proto__ = MessageProto;

          return message;
        })
      );

      patches.push(
        after("type", MessageContent, function ([{message}], ret) {
          console.log(message, ret);
          const edits = (message.edits ?? []).map((edit) => {
            return React.createElement(
              "div",
              {
                className: [
                  MarkupClasses.markup,
                  MessageClasses.messageContent,
                  "ml-edit",
                ].join(" "),
              },
              SimpleMarkdown.parse(edit.content),
              " ",
              React.createElement(
                MessageTimestamp,
                {timestamp: edit.timestamp, isEdited: true, isInline: false},
                React.createElement(
                  "span",
                  {className: MessageClasses.edited},
                  `(${edit.original ? "original" : "past edit"})`
                )
              )
            );
          });

          if (message.deleted) {
            ret.props.className += " ml-deleted";
            ret.props.children.push(
              React.createElement(
                "span",
                {className: "ml-deleted-suffix"},
                " (deleted)"
              )
            );
          }

          return edits.length > 0 ? [...edits, ret] : ret;
        })
      );
    },
    onUnload() {
      for (const unpatch of patches) unpatch();
    },
  };
};
