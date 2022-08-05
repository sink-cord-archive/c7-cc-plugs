import {findByProps} from "@cumcord/modules/webpack";
import {after} from "@cumcord/patcher";
//import {React} from "@cumcord/modules/common";

import MessagePreviewAccessory from "./MessagePreviewAccessory";

const {MessageAccessories} = findByProps("MessageAccessories");

let unpatch;

export function onLoad() {
  unpatch = after("render", MessageAccessories.prototype, function (_, ret) {
    if (this?.props && ret?.props)
      ret.props.children.push(
        <MessagePreviewAccessory message={this.props.message} />
      );
  });
}

export const onUnload = () => unpatch();
