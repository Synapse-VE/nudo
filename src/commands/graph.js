import { readEvents } from "../log.js";
import { fold, resolveId } from "../model.js";
import { style, useColor } from "../render.js";

function label(note) {
  const text = note.text.replace(/\s+/g, " ");
  return `${note.id.slice(0, 8)} ${text.length > 40 ? `${text.slice(0, 39)}…` : text}`;
}

function tree(note, byId, depth, prefix, isLast, seen, lines) {
  const connector = isLast ? "└─ " : "├─ ";
  lines.push(`${prefix}${connector}${label(note)}`);

  if (depth <= 1) return;

  const children = note.links
    .map((link) => ({ link, target: byId.get(link.to) }))
    .filter((entry) => entry.target && !seen.has(entry.target.id));

  children.forEach((entry, index) => {
    const last = index === children.length - 1;
    const nextPrefix = prefix + (isLast ? "   " : "│  ");
    seen.add(entry.target.id);
    tree(entry.target, byId, depth - 1, nextPrefix, last, seen, lines);
  });
}

export default {
  name: "graph",
  summary: "Muestra los enlaces entre notas",
  usage: "nudo graph [<id>] [--depth N] [--json]",
  options: {
    depth: { type: "number", default: 3 },
    json: { type: "boolean" },
  },
  run({ options, args }) {
    const notes = fold(readEvents()).filter((note) => !note.deleted);
    const byId = new Map(notes.map((note) => [note.id, note]));

    if (options.json) {
      const edges = notes.flatMap((note) =>
        note.links
          .filter((link) => byId.has(link.to))
          .map((link) => ({ from: note.id, to: link.to, label: link.label })),
      );
      console.log(JSON.stringify(edges, null, 2));
      return 0;
    }

    const s = style(useColor());

    if (!args[0]) {
      const edges = notes.flatMap((note) =>
        note.links.filter((link) => byId.has(link.to)).map((link) => ({ note, link })),
      );

      if (edges.length === 0) {
        console.log("Todavia no hay enlaces. Prueba con: nudo link <desde> <hacia>");
        return 0;
      }

      for (const { note, link } of edges) {
        const target = byId.get(link.to);
        console.log(`${s.dim(note.id.slice(0, 8))} -> ${s.dim(target.id.slice(0, 8))}  ${label(target)}${link.label ? s.cyan(` (${link.label})`) : ""}`);
      }

      const linked = new Set(edges.flatMap(({ note, link }) => [note.id, link.to]));
      console.log(s.dim(`\n${edges.length} enlaces · ${notes.length - linked.size} notas sueltas`));
      return 0;
    }

    const matches = resolveId(notes, args[0]);
    if (matches.length === 0) {
      console.error(`no existe una nota con id "${args[0]}"`);
      return 1;
    }
    if (matches.length > 1) {
      console.error(`id ambiguo "${args[0]}": coincide con ${matches.length} notas`);
      return 1;
    }

    const lines = [];
    tree(matches[0], byId, options.depth, "", true, new Set([matches[0].id]), lines);
    console.log(lines.join("\n"));
    return 0;
  },
};
