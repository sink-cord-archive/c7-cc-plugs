import {findByDisplayName} from "@cumcord/modules/webpack";
import {instead} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

const UserActivity = findByDisplayName("UserActivity");
const ActivityTimeBar = findByDisplayName("ActivityTimeBar");

let unpatchTimeBar;
let unpatchTimePlayed;

export default (data) => {
  return {
    onLoad() {
      unpatchTimeBar = instead(
        "renderTimeBar",
        UserActivity.prototype,
        function([activity]) {
          const {timestamps} = activity;
          if (!timestamps) return null;
          const {start, end} = timestamps;
          if (!start || !end) return null;

          return <ActivityTimeBar
            start={start}
            end={end}
            className={this.getTypeClass("timeBar")}
            themed={this.props.type === UserActivity.Types.VOICE_CHANNEL}
          />;
        }
      );
      unpatchTimePlayed = instead(
        "renderTimePlayed",
        UserActivity.prototype,
        function([activity], orig) {
          if (
            activity.timestamps != null &&
            activity.timestamps.start != null &&
            activity.timestamps.end != null
          )
            return null;

          return orig([activity]);
        }
      );
    },
    onUnload() {
      unpatchTimeBar();
      unpatchTimePlayed();
    }
  };
};
