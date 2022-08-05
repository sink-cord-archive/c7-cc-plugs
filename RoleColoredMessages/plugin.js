import {find, findByProps} from "@cumcord/modules/webpack";
import {after} from "@cumcord/patcher";

const MessageContent = find((x) => x?.type?.displayName === "MessageContent");

const ChannelStore = findByProps("getChannel", "getDMUserIds");
const MemberStore = findByProps("getMember");
const UserSettingsStore = findByProps("MessageDisplayCompact");

const tinycolor = findByProps("fromRatio");

let unpatch;

export function onLoad() {
  unpatch = after("type", MessageContent, function ([{message}], ret) {
    if (message.author?.id !== "1") {
      const guildId = ChannelStore.getChannel(message.channel_id)?.guild_id;
      const member = guildId
        ? MemberStore.getMember(guildId, message.author.id)
        : null;

      if (!member?.colorString) return;

      const theme = UserSettingsStore.ThemeDoNotUseYet.getSetting();
      const initialColor = tinycolor(member.colorString);
      const isDark = theme === "dark";
      const adjustedColor =
        isDark
          ? initialColor.brighten(30)
          : initialColor.darken(10);
      ret.props.style ??= {};
      ret.props.style.color = adjustedColor.toHslString();
    }
  });
}

export const onUnload = () => unpatch()