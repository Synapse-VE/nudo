import { readEvents } from "../log.js";
import { liveNotes } from "../model.js";
import { noteList } from "../output.js";
import { styles } from "../theme.js";
import { formatDay } from "../time.js";

export default {
  name: "today",
  summary: "Muestra las notas de hoy",
  usage: "nudo today [--json]",
  options: {
    json: { type: "boolean" },
  },
  run({ options }) {
    const now = Date.now();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const notes = liveNotes(readEvents()).filter((note) => note.ts >= start.getTime());

    if (options.json) {
      console.log(JSON.stringify(notes, null, 2));
      return 0;
    }

    if (notes.length === 0) {
      console.log(`Todavia no anotaste nada hoy (${formatDay(now)}).`);
      return 0;
    }

    const s = styles();
    console.log(s.bold(`Hoy, ${formatDay(now)}`) + s.dim(` · ${notes.length} ${notes.length === 1 ? "nota" : "notas"}`));
    console.log("");
    console.log(noteList(notes, { styles: s, columns: process.stdout.columns }));
    return 0;
  },
};
