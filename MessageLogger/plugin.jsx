import { findByProps, find, findByDisplayName } from "@cumcord/modules/webpack";
import { instead, after, injectCSS } from "@cumcord/patcher";
import { FluxDispatcher } from "@cumcord/modules/common";

const MessageContent = find((x) => x?.type?.displayName === "MessageContent");

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
      FluxDispatcher.dispatch({
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

export function onLoad() {
  injectCSS(css);

  // stackable, feel free to use in your own plugins
  patches.push(
    instead("_dispatchWithDevtools", FluxDispatcher, function ([event], orig) {
      event = interceptEvent(event);

      if (event) {
        orig.apply(this, [event]);
      }
    }),
  );

  patches.push(
    instead("updateMessageRecord", MessageRecord, function ([oldRecord, newRecord], orig) {
      if (newRecord.deleted) {
        return MessageRecord.createMessageRecord(newRecord, oldRecord.reactions);
      }

      return orig.apply(this, [oldRecord, newRecord]);
    }),
  );

  patches.push(
    after("createMessageRecord", MessageRecord, function ([message], record) {
      record.edits = message.edits;
      record.deleted = message.deleted;
    }),
  );

  patches.push(
    after("compare", MessageContent, function ([oldProps, newProps], shouldUpdate) {
      return (
        shouldUpdate &&
        oldProps.message.edits === newProps.message.edits &&
        oldProps.message.deleted === newProps.message.deleted
      );
    }),
  );

  const MessageProto = Message.default.prototype;
  patches.push(
    after("default", Message, function ([props], message) {
      message.deleted = !!props.deleted;
      message.edits = props.edits;

      message.prototype = MessageProto;
      message.__proto__ = MessageProto;

      return message;
    }),
  );

  patches.push(
    after("type", MessageContent, function ([{ message }], ret) {
      const edits = (message.edits ?? []).map((edit) => (
        <div className={[MarkupClasses.markup, MessageClasses.messageContent, "ml-edit"].join(" ")}>
          {SimpleMarkdown.parse(edit.content)}{" "}
          <MessageTimestamp timestamp={edit.timestamp} isEdited={true} isInline={true}>
            <span className={MessageClasses.edited}>
              ({edit.original ? "original" : "past edit"})
            </span>
          </MessageTimestamp>
        </div>
      ));

      if (message.deleted) {
        ret.props.className += " ml-deleted";
        ret.props.children.push(<span className="ml-deleted-suffix"> (deleted)</span>);
      }

      return edits.length > 0 ? [...edits, ret] : ret;
    }),
  );
}

export function onUnload() {
  for (const channelId in ChannelMessages._channelMessages) {
    const messages = ChannelMessages._channelMessages[channelId]._array;
    for (const message of messages) {
      if (message.deleted) {
        FluxDispatcher.dispatch({
          type: "MESSAGE_DELETE",
          channelId: message.channel_id,
          id: message.id,
          __messageLogger: true,
        });
      }
      if (message.edits) {
        const data = message.toJS();
        delete data.edits;
        FluxDispatcher.dispatch({
          message: {
            ...data,
            id: message.id,
            channel_id: message.channel_id,
            guild_id: ChannelStore.getChannel(message.channel_id).guild_id,
          },
          type: "MESSAGE_UPDATE",
        });
      }
    }
  }

  for (const unpatch of patches) unpatch();
}
