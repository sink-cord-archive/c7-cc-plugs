import {findByProps} from "@cumcord/modules/webpack";
import {instead, injectCSS} from "@cumcord/patcher";
//import {React} from "@cumcord/modules/common";

const SimpleMarkdown = findByProps("parseEmbedTitle");

const css = `.theme-dark .greentext {
  color: #afc960;
}
.theme-light .greentext {
  color: #789922;
}`;

let unpatchParse;
export default (data) => {
  return {
    onLoad() {
      injectCSS(css);
      unpatchParse = instead("parse", SimpleMarkdown, function (args) {
        return SimpleMarkdown.reactParserFor(
          Object.assign(
            {
              greentext: {
                order: SimpleMarkdown.defaultRules.text.order,
                match: function (text, state) {
                  if (state.inGreentext || state.inQuote) return null;
                  return (
                    /^$|\n$/.test(
                      state.prevCapture != null ? state.prevCapture[0] : ""
                    ) && /^(>.+?)(?:\n|$)/.exec(text)
                  );
                },
                parse: function (capture, parse, state) {
                  state.inGreentext = true;
                  const node = {
                    content: parse(capture[0], state),
                    type: "greentext",
                  };
                  delete state.inGreentext;
                  return node;
                },
                react: function (node, recurseOutput, state) {
                  return <span className="greentext">{recurseOutput(node.content, state)}</span>
                },
              },
            },
            SimpleMarkdown.defaultRules
          )
        ).apply(this, args);
      });
    },
    onUnload() {
      if (unpatchParse) unpatchParse();
    },
  };
};
