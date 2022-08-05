import {findByDisplayName, findByDispNameDeep, findByProps} from "@cumcord/modules/webpack";
import {findInReactTree} from "@cumcord/utils";
import {after, before} from "@cumcord/patcher";
//import {React} from "@cumcord/modules/common";
import IconsWrapper from "./IconsWrapper";

const MemberListItemMemo = findByProps("AVATAR_DECORATION_PADDING");
const PrivateChannel = findByDispNameDeep("PrivateChannel");
const AvatarWithText = findByDisplayName("AvatarWithText", false);
const UserPopoutComponents = findByProps("UserPopoutInfo");

const DMChannelStore = findByProps("getDMUserIds");
const UserStore = findByProps("getUser", "getCurrentUser");

const patches = [];

export default (data) => {
  return {
    onLoad() {
      // member list
      const unpatchMemo = after("type", MemberListItemMemo.default, (a, r) => {
        unpatchMemo();
        const MemberListItem = r.type;

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
      });
      patches.push(unpatchMemo);

      // dm list
      patches.push(
        after("render", PrivateChannel.prototype, function(_, ret) {
          //debugger;
          const pcProps = this.props;
          if (pcProps.channel?.type !== 1) return;
          if (!pcProps.user) return;

          patches.push(after("children", ret.props, (_, subRet) => {
            const target = findInReactTree(subRet, n => n?.decorators !== undefined);
            if (!target) return;

            if (!Array.isArray(target.decorators))
              target.decorators = [target.decorators];

            target.decorators.push(
              <IconsWrapper user={pcProps.user} />
            );
          }));
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
      patches.forEach(e => e());
      patches.splice(0, patches.length);
    }
  };
};
