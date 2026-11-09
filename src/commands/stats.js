import { readEvents } from "../log.js";
import { fold } from "../model.js";
import { bar, table } from "../render.js";
import { styles } from "../theme.js";
import { countByTag, dailySeries, summary } from "../stats.js";

const INTENSITY = ["·", "░", "▒", "▓", "█"];

function heatmap(series) {
  const max = Math.max(1, ...series.map((entry) => entry.count));
  return series
    .map((entry) => {
      const level = entry.count === 0 ? 0 : Math.ceil((entry.count / max) * (INTENSITY.length - 1));
      return `${entry.day.slice(5)} ${INTENSITY[level]} ${entry.count}`;
    })
    .join("\n");
}

export default {
  name: "stats",
  summary: "Cuenta notas por etiqueta o por dia",
  usage: "nudo stats [--by tag|day] [--days N] [--limit N] [--json]",
  options: {
    by: { type: "string", default: "tag" },
    days: { type: "number", default: 14 },
    limit: { type: "number", default: 10 },
    json: { type: "boolean" },
  },
  run({ options }) {
    if (options.by !== "tag" && options.by !== "day") {
      console.error(`nudo stats: --by debe ser "tag" o "day"`);
      return 2;
    }

    const notes = fold(readEvents());
    const live = notes.filter((note) => !note.deleted);
    const totals = summary(notes);
    const s = styles();

    if (options.by === "day") {
      const series = dailySeries(live, { days: options.days });

      if (options.json) {
        console.log(JSON.stringify({ ...totals, days: series }, null, 2));
        return 0;
      }

      console.log(s.bold(`Ultimos ${options.days} dias`));
      console.log(heatmap(series));
      console.log(s.dim(`${totals.live} notas vivas · ${totals.deleted} borradas`));
      return 0;
    }

    const tags = countByTag(live).slice(0, options.limit);

    if (options.json) {
      console.log(JSON.stringify({ ...totals, tags }, null, 2));
      return 0;
    }

    if (tags.length === 0) {
      console.log("Todavia no hay notas.");
      return 0;
    }

    const max = Math.max(...tags.map((entry) => entry.count));
    const rows = tags.map((entry) => [s.cyan(entry.tag), bar(entry.count, max, 16), String(entry.count)]);

    console.log(s.bold("Etiquetas"));
    console.log(table(rows, { align: ["left", "left", "right"] }));
    console.log(s.dim(`${totals.live} notas vivas · ${totals.deleted} borradas · ${totals.tags} etiquetas`));
    return 0;
  },
};
