import {findByDisplayName, find} from "@cumcord/modules/webpack";
import {after} from "@cumcord/patcher";
import {findInReactTree} from "@cumcord/utils";

const UploadButton = find(
  (x) =>
    x.type &&
    typeof x.type == "function" &&
    x.type.toString().indexOf("P.default.Messages.CHAT_ATTACH_UPLOAD_OR_INVITE") > -1
);
const ChannelAttachMenu = findByDisplayName("ChannelAttachMenu", false);

const patches = [];

export default () => {
  return {
    onLoad() {
      patches.push(
        after("type", UploadButton, function(args, ret) {
          const button = findInReactTree(
            ret,
            (x) => typeof x?.children === "function"
          );
          if (button)
            after("children", button, function(args, ret) {
              const openMenu = ret.props.onClick;
              const instaUpload = ret.props.onDoubleClick;

              ret.props.onClick = instaUpload;
              ret.props.onContextMenu = openMenu;
              delete ret.props.onDoubleClick;
              console.log(ret);
            });
        })
      );

      patches.push(
        after("default", ChannelAttachMenu, function(args, ret) {
          const uploadFile = findInReactTree(
            ret,
            (x) => x?.id === "upload-file"
          );
          if (uploadFile) {
            delete uploadFile.subtext;
          }
        })
      );
    },
    onUnload: () => patches.forEach(e => e())
  };
};
