import {
  findByDisplayName,
  findByProps,
  findByPropsAll
} from "@cumcord/modules/webpack";
//import {React} from "@cumcord/modules/common";

const Flux = findByProps("useStateFromStores");
const Constants = findByProps("UserSettingsSections");
const Messages = findByPropsAll("Messages")[1].Messages;

const Tooltip = findByDisplayName("Tooltip");

const UserStatusStore = findByProps("getAllApplicationActivities");

const IconDesktop = findByDisplayName("Monitor");
const IconMobile = findByDisplayName("MobileDevice");
const IconWeb = findByDisplayName("Globe");

const PlatformIcons = {
  desktop: IconDesktop,
  mobile: IconMobile,
  web: IconWeb
};
const StatusColors = {
  online: Constants.Colors.STATUS_GREEN_600,
  idle: Constants.Colors.STATUS_YELLOW_500,
  dnd: Constants.Colors.STATUS_RED_500
};
const StatusNames = {
  online: Messages.STATUS_ONLINE,
  idle: Messages.STATUS_IDLE,
  dnd: Messages.STATUS_DND
};

export default function({user}) {
  const platforms = Flux.useStateFromStores(
    [UserStatusStore],
    () => UserStatusStore.getState()?.clientStatuses?.[user.id] || {},
    [user]
  );

  const elements = [];

  for (const platform of Object.keys(platforms)) {
    const status = platforms[platform];
    elements.push(
      <Tooltip text={`${StatusNames[status]} on ${platform}`}>{(props) =>
        React.createElement(
          PlatformIcons[platform],
          Object.assign({}, props, {
            color: StatusColors[status],
            width: 16,
            height: 16,
            style: {
              margin: "1px"
            }
          })
        )}</Tooltip>
    );
  }

  return (
    !user.bot &&
    <div className="platform-icons-wrapper" style={{marginLeft: "4px"}}>{elements}</div>
  );
}
