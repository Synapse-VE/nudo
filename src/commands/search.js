import { UsageError } from "../errors.js";
import { readEvents } from "../log.js";
import { liveNotes } from "../model.js";
import { noteList } from "../output.js";
import { searchNotes } from "../query.js";
import { styles } from "../theme.js";
import { parseWhen } from "../time.js";

export default {
  name: "search",
  summary: "Busca notas por texto o etiqueta",
  usage: "nudo search <terminos...> [-t etiqueta]... [--since <cuando>] [--limit N]",
  options: {
    tag: { type: "multi", short: "t" },
    since: { type: "string" },
    until: { type: "string" },
    limit: { type: "number", default: 20 },
    json: { type: "boolean" },
  },
  run({ options, args }) {
    const query = args.join(" ").trim();
    if (query === "") {
      throw new UsageError("falta el texto a buscar");
    }

    /** @type {any} */
    const filters = { tags: options.tag, limit: options.limit };

    for (const key of ["since", "until"]) {
      if (!options[key]) continue;
      try {
        filters[key] = parseWhen(options[key]);
      } catch (error) {
        throw new UsageError(error.message);
      }
    }

    const matches = searchNotes(liveNotes(readEvents()), query, filters);

    if (options.json) {
      const payload = matches.map((match) => ({ ...match.note, score: Number(match.score.toFixed(3)) }));
      console.log(JSON.stringify(payload, null, 2));
      return 0;
    }

    if (matches.length === 0) {
      console.log(`Sin resultados para "${query}".`);
      return 0;
    }

    console.log(
      noteList(
        matches.map((match) => match.note),
        { styles: styles(), columns: process.stdout.columns },
      ),
    );
    return 0;
  },
};
