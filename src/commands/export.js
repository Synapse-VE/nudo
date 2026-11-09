import { writeFileSync } from "node:fs";

import { UsageError } from "../errors.js";
import { toMarkdown } from "../export.js";
import { readEvents } from "../log.js";
import { liveNotes } from "../model.js";
import { filterNotes } from "../query.js";
import { parseWhen } from "../time.js";

const FORMATS = ["md", "json"];

export default {
  name: "export",
  summary: "Exporta las notas a markdown o json",
  usage: "nudo export [--format md|json] [--out <archivo>] [-t etiqueta]... [--since <cuando>]",
  options: {
    format: { type: "string", default: "md" },
    out: { type: "string" },
    tag: { type: "multi", short: "t" },
    since: { type: "string" },
    until: { type: "string" },
  },
  run({ options }) {
    if (!FORMATS.includes(options.format)) {
      throw new UsageError(`formato desconocido "${options.format}" (usa ${FORMATS.join(" o ")})`);
    }

    /** @type {any} */
    const filters = { tags: options.tag };
    for (const key of ["since", "until"]) {
      if (!options[key]) continue;
      try {
        filters[key] = parseWhen(options[key]);
      } catch (error) {
        throw new UsageError(error.message);
      }
    }

    const notes = filterNotes(liveNotes(readEvents()), { ...filters, reverse: true });
    const output =
      options.format === "json" ? `${JSON.stringify(notes, null, 2)}\n` : toMarkdown(notes);

    if (options.out) {
      writeFileSync(options.out, output);
      console.log(`exportadas ${notes.length} notas a ${options.out}`);
      return 0;
    }

    process.stdout.write(output);
    return 0;
  },
};
