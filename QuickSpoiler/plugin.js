import {findByDisplayName, findByProps} from "@cumcord/modules/webpackModules";
import {after} from "@cumcord/patcher";
import {React, i18n} from "@cumcord/modules/common";
import {findInTree, getReactInstance} from "@cumcord/utils";

const MiniPopover = findByDisplayName("MiniPopover", false);
const IconEyeHidden = findByDisplayName("EyeHidden");
const Tooltip = findByProps("TooltipContainer").default;

const AttachmentUtils = findByProps("popFirstFile", "setUploads");
const AttachmentAreaClasses = findByProps("actionBarIcon");

let unpatch;

export default (data) => {
  return {
    onLoad() {
      unpatch = after("default", MiniPopover, (_, ret) => {
        if (
          ret?.props?.children?.[0]?.props?.text ==
          i18n.Messages.ATTACHMENT_UTILITIES_MODIFY
        ) {
          ret.props.children.splice(
            0,
            0,
            React.createElement(
              Tooltip,
              {
                text: i18n.Messages.SPOILER_MARK_SELECTED,
                hideOnClick: true,
              },
              (tooltipProps) =>
                React.createElement(
                  MiniPopover.Button,
                  {
                    onMouseEnter: tooltipProps.onMouseEnter,
                    onMouseLeave: tooltipProps.onMouseLeave,
                    onClick: () => {
                      const AttachmentAreaNode = document.querySelector(
                        "." + AttachmentAreaClasses.channelAttachmentArea
                      );
                      if (AttachmentAreaNode) {
                        const AttachmentArea =
                          getReactInstance(AttachmentAreaNode);
                        if (AttachmentArea) {
                          const uploadProps = findInTree(
                            AttachmentArea.memoizedProps,
                            (x) => x?.upload
                          );
                          if (uploadProps) {
                            AttachmentUtils.update(
                              uploadProps.channelId,
                              uploadProps.upload.id,
                              {
                                spoiler: !uploadProps.upload.spoiler,
                              }
                            );
                          }
                        }
                      }
                    },
                  },
                  React.createElement(IconEyeHidden, {
                    className: AttachmentAreaClasses.actionBarIcon,
                  })
                )
            )
          );
        }
      });
    },
    onUnload() {
      unpatch();
    },
  };
};
