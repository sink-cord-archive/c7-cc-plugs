import {findByDisplayName, findByProps} from "@cumcord/modules/webpack";
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
            <Tooltip text={i18n.Messages.SPOILER_MARK_SELECTED} hideonClick={true}>
              {(tooltipProps) =>
                <MiniPopover.Button
                  onMouseEnter={tooltipProps.onMouseEnter}
                  onMouseLeave={tooltipProps.onMouseLeave}
                  onClick={() => {
                    const AttachmentAreaNode = document.querySelector(
                      "." + AttachmentAreaClasses.channelAttachmentArea
                    );
                    if (!AttachmentAreaNode) return;

                    const AttachmentArea =
                      getReactInstance(AttachmentAreaNode);
                    if (!AttachmentArea) return;

                    const uploadProps = findInTree(
                      AttachmentArea.memoizedProps,
                      (x) => x?.upload
                    );
                    if (!uploadProps) return;

                    AttachmentUtils.update(
                      uploadProps.channelId,
                      uploadProps.upload.id,
                      {
                        spoiler: !uploadProps.upload.spoiler
                      }
                    );
                  }}
                >
                  <IconEyeHidden className={AttachmentAreaClasses.actionBarIcon} />
                </MiniPopover.Button>
              }
            </Tooltip>
          );
        }
      });
    },
    onUnload: () => unpatch()
  };
};
