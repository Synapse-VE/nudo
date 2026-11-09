import { readEvents } from "../log.js";
import { fold } from "../model.js";
import { style, useColor } from "../render.js";
import { streaks } from "../stats.js";

export default {
  name: "streak",
  summary: "Muestra la racha de dias seguidos con notas",
  usage: "nudo streak [--json]",
  options: {
    json: { type: "boolean" },
  },
  run({ options }) {
    const live = fold(readEvents()).filter((note) => !note.deleted);
    const result = streaks(live);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    if (result.longest === 0) {
      console.log("Todavia no hay notas.");
      return 0;
    }

    const s = style(useColor());
    console.log(`Racha actual: ${s.bold(String(result.current))} ${result.current === 1 ? "dia" : "dias"}`);
    console.log(`Racha maxima: ${s.bold(String(result.longest))} ${result.longest === 1 ? "dia" : "dias"}`);
    console.log(s.dim(`Ultima nota: ${result.last}`));
    return 0;
  },
};
