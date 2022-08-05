import {findByDisplayName, findByProps} from "@cumcord/modules/webpack";
//import {React} from "@cumcord/modules/common";
import {persist} from "@cumcord/pluginData";
import {useNest} from "@cumcord/utils";

const SwitchItem = findByDisplayName("SwitchItem");
const Slider = findByDisplayName("Slider");

const ControlClasses = findByProps("title", "titleDefault", "dividerDefault");
const Margins = findByProps("marginTop8", "marginCenterHorz", "marginLarge");

export default function MoyaiSettings() {
  useNest(persist);

  return <div>
    <div className={Margins.marginBottom8}>
      <label className={ControlClasses.title}>Volume</label>
      <Slider initialValue={(persist.ghost.volume || 0.5) * 100}
              minValue={0}
              maxValue={100}
              onValueChange={(value) => (persist.store.volume = value / 100)} />
    </div>
    <SwitchItem
      value={persist.ghost.allowReactions || false}
      hideBorder={true}
      onChange={(event) =>
        (persist.store.allowReactions =
          typeof event == "object" ? event.target.checked : event)}
    >Play on reactions</SwitchItem>

    <SwitchItem
      value={persist.ghost.husk || false}
      hideBorder={true}
      onChange={(event) =>
        (persist.store.husk =
          typeof event == "object" ? event.target.checked : event)}
    >Play for Aliucord husk</SwitchItem>
  </div>;

}
