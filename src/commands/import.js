import { readFileSync } from "node:fs";
import { extname } from "node:path";

import { UsageError } from "../errors.js";
import { ulid } from "../id.js";
import { parseJsonl, parseMarkdown, parseNotesJson } from "../import.js";
import { appendEvent, readEvents } from "../log.js";
import { fold } from "../model.js";

function detect(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".jsonl") return "jsonl";
  if (ext === ".json") return "json";
  if (ext === ".md" || ext === ".markdown") return "md";
  return null;
}

export default {
  name: "import",
  summary: "Importa notas desde JSONL, JSON o markdown",
  usage: "nudo import <archivo> [--dry-run]",
  options: {
    "dry-run": { type: "boolean" },
  },
  run({ options, args }) {
    const [path] = args;
    if (!path) {
      throw new UsageError("falta el archivo a importar");
    }

    const format = detect(path);
    if (!format) {
      throw new UsageError(`formato no reconocido: ${path} (usa .jsonl, .json o .md)`);
    }

    let raw;
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      console.error(`no se pudo leer ${path}`);
      return 1;
    }

    const existing = fold(readEvents());
    const knownIds = new Set(existing.map((note) => note.id));
    const knownTexts = new Set(existing.map((note) => `${note.ts}::${note.text}`));
    const pending = [];
    let skipped = 0;
    const errors = [];

    if (format === "jsonl") {
      const parsed = parseJsonl(raw);
      errors.push(...parsed.errors);
      for (const event of parsed.events) {
        if (knownIds.has(event.id)) {
          skipped += 1;
          continue;
        }
        pending.push(event);
      }
    } else {
      const parsed = format === "json" ? parseNotesJson(raw) : parseMarkdown(raw);
      errors.push(...parsed.errors);
      for (const note of parsed.notes) {
        const key = `${note.ts}::${note.text}`;
        if (knownTexts.has(key)) {
          skipped += 1;
          continue;
        }
        knownTexts.add(key);
        pending.push({
          v: 1,
          id: ulid(note.ts),
          ts: note.ts,
          type: "note",
          text: note.text,
          tags: note.tags,
          meta: note.meta,
        });
      }
    }

    for (const error of errors) console.error(`aviso: ${error}`);

    if (options["dry-run"]) {
      console.log(`se importarian ${pending.length} notas (${skipped} omitidas)`);
      return 0;
    }

    for (const event of pending) appendEvent(event);
    console.log(`importadas ${pending.length} notas (${skipped} omitidas)`);
    return 0;
  },
};
