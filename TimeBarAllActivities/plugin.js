import {findByDisplayName} from "@cumcord/modules/webpackModules";
import {instead} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

const UserActivity = findByDisplayName("UserActivity");
const ActivityTimeBar = findByDisplayName("ActivityTimeBar");

let unpatch;

export default (data) => {
  return {
    onLoad() {
      unpatch = instead(
        "renderTimeBar",
        UserActivity.prototype,
        function ([activity]) {
          const {timestamps} = activity;
          if (!timestamps) return null;
          const {start, end} = timestamps;
          if (!start || !end) return null;

          return React.createElement(ActivityTimeBar, {
            start,
            end,
            className: this.getTypeClass("timeBar"),
            themed: this.props.type === UserActivity.Types.VOICE_CHANNEL,
          });
        }
      );
    },
    onUnload() {
      unpatch();
    },
  };
};
