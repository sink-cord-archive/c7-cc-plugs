import {findByDisplayName, find} from "@cumcord/modules/webpack";
import {after} from "@cumcord/patcher";
import {findInReactTree} from "@cumcord/utils";

const UploadButton = find(
  (x) =>
    x.type &&
    typeof x.type == "function" &&
    x.type.toString().indexOf('"Upload Message Attachment Max Size Error"') > -1
);
const ChannelAttachMenu = findByDisplayName("ChannelAttachMenu", false);

const patches = [];

export default () => {
  return {
    onLoad() {
      patches.push(
        after("type", UploadButton, function (args, ret) {
          const button = findInReactTree(
            ret,
            (x) => x?.children && typeof x.children == "function"
          );
          if (button)
            after("children", button, function (args, ret) {
              const onClick = ret.props.onClick;
              const onDoubleClick = ret.props.onDoubleClick;

              ret.props.onClick = onDoubleClick;
              ret.props.onContextMenu = onClick;
              delete ret.props.onDoubleClick;
            });
        })
      );

      patches.push(
        after("default", ChannelAttachMenu, function (args, ret) {
          const uploadFile = findInReactTree(
            ret,
            (x) => x?.id == "upload-file"
          );
          if (uploadFile) {
            delete uploadFile.subtext;
          }
        })
      );
    },
    onUnload() {
      for (const unpatch of patches) {
        unpatch();
      }
    },
  };
};
