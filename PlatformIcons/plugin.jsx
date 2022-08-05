import {
  find,
  findByDisplayName,
  findByProps
} from "@cumcord/modules/webpack";
import {findInReactTree} from "@cumcord/utils";
import {before, after} from "@cumcord/patcher";
//import {React} from "@cumcord/modules/common";

import IconsWrapper from "./IconsWrapper";

const MemberListItem = findByDisplayName("MemberListItem");
const PrivateChannel = find(
  (x) =>
    x &&
    x.default &&
    x.default.render &&
    typeof x.default.render == "function" &&
    x.default.render
      .toString()
      .match(/{className:.\.default\.nameAndDecorators}/)
);
const UserPopoutComponents = findByProps("UserPopoutInfo");

const DMChannelStore = findByProps("getDMUserIds");
const UserStore = findByProps("getUser", "getCurrentUser");

const patches = [];

export default (data) => {
  return {
    onLoad() {
      // member list
      patches.push(
        after("renderDecorators", MemberListItem.prototype, (_, ret) => {
          const {props} = ret._owner.stateNode;
          ret.props.children.splice(
            0,
            0,
            <IconsWrapper user={props.user} />
          );
        })
      );

      // dm list
      patches.push(
        before("render", PrivateChannel.default, ([props]) => {
          if (props.to && typeof props.to == "string") {
            const channelId = props.to.match(/@me\/(.+?)$/)[1];
            if (channelId) {
              const channel = DMChannelStore.getChannel(channelId);
              if (channel?.type == 1) {
                const userId = channel.recipients[0];
                const user = UserStore.getUser(userId);

                if (user) {
                  if (!Array.isArray(props.decorators)) {
                    props.decorators = [props.decorators];
                  }

                  props.decorators.push(
                    <IconsWrapper user={user} />
                  );
                }
              }
            }
          }
        })
      );

      // user popout
      patches.push(
        after("UserPopoutInfo", UserPopoutComponents, (_, ret) => {
          const headerText = findInReactTree(
            ret,
            (x) => x.className && x.className.startsWith("headerText-")
          );
          if (headerText) {
            const nameTag = headerText.children[1];
            headerText.children[1] =
              <div style={{display: "flex", flexDirection: "row"}}>
                {nameTag}
                <IconsWrapper user={nameTag.props.user} />
              </div>;
          }
        })
      );
    },
    onUnload() {
      for (const unpatch of patches) {
        unpatch();
      }
      patches.splice(0, patches.length);
    }
  };
};
