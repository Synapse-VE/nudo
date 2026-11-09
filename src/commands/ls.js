import { UsageError } from "../errors.js";
import { readEvents } from "../log.js";
import { liveNotes } from "../model.js";
import { noteList } from "../output.js";
import { filterNotes } from "../query.js";
import { style, useColor } from "../render.js";
import { parseWhen } from "../time.js";

export default {
  name: "ls",
  summary: "Lista las notas, de la mas reciente a la mas vieja",
  usage: "nudo ls [-t etiqueta]... [--since <cuando>] [--until <cuando>] [--limit N] [--reverse]",
  options: {
    tag: { type: "multi", short: "t" },
    since: { type: "string" },
    until: { type: "string" },
    limit: { type: "number", default: 20 },
    reverse: { type: "boolean" },
  },
  run({ options }) {
    const notes = liveNotes(readEvents());
    /** @type {any} */
    const filters = {
      tags: options.tag,
      limit: options.limit,
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

    if (result.length === 0) {
      console.log("No hay notas para esos filtros.");
      return 0;
    }

    console.log(
      noteList(result, {
        styles: style(useColor()),
        columns: process.stdout.columns,
      }),
    );
    return 0;
  },
};
