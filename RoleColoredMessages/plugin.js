import {find, findByProps} from "@cumcord/modules/webpack";
import {after} from "@cumcord/patcher";

const MessageContent = find((x) => x?.type?.displayName == "MessageContent");

const ChannelStore = findByProps("getChannel", "getDMUserIds");
const MemberStore = findByProps("getMember");
const UserSettingsStore = findByProps("MessageDisplayCompact");

const tinycolor = findByProps("fromRatio");

let unpatch;
export default () => {
  return {
    onLoad() {
      unpatch = after("type", MessageContent, function ([{message}], ret) {
        if (message.author?.id != "1") {
          const guildId = ChannelStore.getChannel(message.channel_id).guild_id;
          const member = MemberStore.getMember(guildId, message.author.id);

          if (member?.colorString) {
            const theme = UserSettingsStore.ThemeDoNotUseYet.getSetting();
            const initalColor = tinycolor(member.colorString);

            const isDark = theme == "dark";

            const adjustedColor = initalColor[isDark ? "brighten" : "darken"](
              isDark ? 30 : 10
            );

            ret.props.style = ret.props.style || {};
            ret.props.style.color = adjustedColor.toHslString();
          }
        }
      });
    },
    onUnload() {
      unpatch();
    },
  };
};
