import {
  findByDisplayName,
  findByProps,
  findByPropsAll,
} from "@cumcord/modules/webpack";

const Flux = findByProps("useStateFromStores");
const Constants = findByProps("UserSettingsSections");
const {humanizeStatus} = findByProps("humanizeStatus");

const Tooltip = findByDisplayName("Tooltip");

const UserStatusStore = findByProps("getAllApplicationActivities");

const IconDesktop = findByDisplayName("Monitor");
const IconMobile = findByDisplayName("MobileDevice");
const IconWeb = findByDisplayName("Globe");
const IconEmbedded = findByDisplayName("PlatformXbox");

const PlatformIcons = {
  desktop: IconDesktop,
  mobile: IconMobile,
  web: IconWeb,
  embedded: IconEmbedded,
};
const StatusColors = {
  online: Constants.Colors.STATUS_GREEN_600,
  idle: Constants.Colors.STATUS_YELLOW_500,
  dnd: Constants.Colors.STATUS_RED_500,
};

export default function ({user}) {
  const platforms = Flux.useStateFromStores(
    [UserStatusStore],
    () => UserStatusStore.getState()?.clientStatuses?.[user.id] || {},
    [user]
  );

  const elements = [];

  for (const platform of Object.keys(platforms)) {
    const status = platforms[platform];
    elements.push(
      <Tooltip text={`${humanizeStatus(status, false)} on ${platform.charAt(0).toUppercase()}${platform.slice(1)}`}>
        {(props) =>
          React.createElement(
            PlatformIcons[platform],
            Object.assign({}, props, {
              color: StatusColors[status],
              width: 16,
              height: 16,
              style: {
                margin: "1px",
              },
            })
          )
        }
      </Tooltip>
    );
  }

  return (
    !user.bot && (
      <div className="platform-icons-wrapper" style={{marginLeft: "4px"}}>
        {elements}
      </div>
    )
  );
}
