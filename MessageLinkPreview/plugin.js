import {findByProps} from "@cumcord/modules/webpackModules";
import {after} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

import MessagePreviewAccessory from "./MessagePreviewAccessory";

const {MessageAccessories} = findByProps("MessageAccessories");

let unpatch;

export default (data) => {
  return {
    onLoad() {
      unpatch = after(
        "render",
        MessageAccessories.prototype,
        function (_, ret) {
          if (this?.props && ret?.props)
            ret.props.children.push(
              React.createElement(MessagePreviewAccessory, {
                message: this.props.message,
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
