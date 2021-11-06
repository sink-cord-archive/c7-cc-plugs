import {findByDisplayName} from "@cumcord/modules/webpackModules";
import {after} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

import IconsWrapper from "./IconsWrapper";

const MemberListItem = findByDisplayName("MemberListItem");

let unpatch;

export default (data) => {
  return {
    onLoad() {
      unpatch = after(
        "renderDecorators",
        MemberListItem.prototype,
        (_, ret) => {
          const {props} = ret._owner.stateNode;
          ret.props.children.splice(
            0,
            0,
            React.createElement(IconsWrapper, {
              user: props.user,
            })
          );
        }
      );
    },
    onUnload() {
      unpatch();
    },
  };
};
