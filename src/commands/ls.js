import { readConfig } from "../config.js";
import { UsageError } from "../errors.js";
import { readEvents } from "../log.js";
import { liveNotes } from "../model.js";
import { noteList, noteListByDay } from "../output.js";
import { filterNotes } from "../query.js";
import { styles } from "../theme.js";
import { parseWhen } from "../time.js";

export default {
  name: "ls",
  summary: "Lista las notas, de la mas reciente a la mas vieja",
  usage: "nudo ls [-t etiqueta]... [--since <cuando>] [--until <cuando>] [--limit N] [--reverse] [--group] [--json]",
  options: {
    tag: { type: "multi", short: "t" },
    since: { type: "string" },
    until: { type: "string" },
    limit: { type: "number" },
    reverse: { type: "boolean" },
    group: { type: "boolean" },
    json: { type: "boolean" },
  },
  run({ options }) {
    const notes = liveNotes(readEvents());
    /** @type {any} */
    const filters = {
      tags: options.tag,
      limit: options.limit ?? readConfig().limit,
      reverse: options.reverse,
    };

    for (const key of ["since", "until"]) {
      if (!options[key]) continue;
      try {
        filters[key] = parseWhen(options[key]);
      } catch (error) {
        throw new UsageError(error.message);
      }
    }

    const result = filterNotes(notes, filters);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    if (result.length === 0) {
      console.log("No hay notas para esos filtros.");
      return 0;
    }

    const options_ = { styles: styles(), columns: process.stdout.columns };
    console.log(options.group ? noteListByDay(result, options_) : noteList(result, options_));
    return 0;
  },
};
