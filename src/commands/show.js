import { readEvents } from "../log.js";
import { fold, resolveId } from "../model.js";
import { styles } from "../theme.js";
import { formatClock, formatDay, relative } from "../time.js";

export default {
  name: "show",
  summary: "Muestra una nota completa por id (o prefijo del id)",
  usage: "nudo show <id>",
  options: {
    json: { type: "boolean" },
  },
  run({ options, args }) {
    if (!args[0]) {
      console.error("falta el id de la nota");
      return 1;
    }

    const matches = resolveId(fold(readEvents()), args[0]);

    if (matches.length === 0) {
      console.error(`no existe una nota con id "${args[0]}"`);
      return 1;
    }
    if (matches.length > 1) {
      console.error(`id ambiguo "${args[0]}": coincide con ${matches.length} notas`);
      return 1;
    }

    const [note] = matches;

    if (options.json) {
      console.log(JSON.stringify(note, null, 2));
      return 0;
    }

    const s = styles();
    const lines = [
      s.bold(note.id) + (note.deleted ? s.red(" (borrada)") : ""),
      `${formatDay(note.ts)} ${formatClock(note.ts)}  ${s.dim(`(${relative(note.ts)})`)}`,
    ];

    if (note.tags.length > 0) lines.push(`etiquetas: ${s.cyan(note.tags.join(", "))}`);

    const metaKeys = Object.keys(note.meta);
    if (metaKeys.length > 0) {
      lines.push(`meta: ${metaKeys.map((key) => `${key}=${note.meta[key]}`).join("  ")}`);
    }

    if (note.links.length > 0) {
      lines.push(`enlaces: ${note.links.map((link) => `${link.to.slice(0, 8)}${link.label ? ` (${link.label})` : ""}`).join(", ")}`);
    }

    lines.push("", note.text);
    console.log(lines.join("\n"));
    return 0;
  },
};
