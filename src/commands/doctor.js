import { existsSync } from "node:fs";

import { logPath, readEvents } from "../log.js";
import { fold } from "../model.js";
import { normalizeTag } from "../tags.js";
import { styles } from "../theme.js";

const KNOWN_TYPES = new Set(["note", "edit", "tag", "delete", "restore", "link", "unlink"]);

export default {
  name: "doctor",
  summary: "Revisa la salud del registro",
  usage: "nudo doctor",
  options: {},
  run() {
    const path = logPath();
    const s = styles();

    console.log(`Registro: ${path}`);

    if (!existsSync(path)) {
      console.log(s.dim("Todavia no hay registro: agrega una nota y volve a correr doctor."));
      return 0;
    }

    let events;
    try {
      events = readEvents(path);
    } catch (error) {
      console.error(s.red(`registro corrupto: ${error.message}`));
      return 1;
    }

    const notes = fold(events);
    const live = notes.filter((note) => !note.deleted);
    const problems = [];

    const noteIds = new Map();
    for (const event of events) {
      if (event.type === "note") noteIds.set(event.id, (noteIds.get(event.id) ?? 0) + 1);
    }
    const duplicated = [...noteIds.values()].filter((count) => count > 1).length;
    if (duplicated > 0) problems.push(`${duplicated} notas con id repetido`);

    const empty = live.filter((note) => note.text.trim() === "").length;
    if (empty > 0) problems.push(`${empty} notas sin texto`);

    const surviving = new Set(notes.map((note) => note.id));
    const dangling = live.flatMap((note) => note.links.filter((link) => !surviving.has(link.to)));
    if (dangling.length > 0) problems.push(`${dangling.length} enlaces rotos`);

    const unknown = events.filter((event) => !KNOWN_TYPES.has(event.type)).length;
    if (unknown > 0) problems.push(`${unknown} eventos de tipo desconocido`);

    const future = live.filter((note) => note.ts > Date.now() + 86_400_000).length;
    if (future > 0) problems.push(`${future} notas con fecha futura`);

    let oddTags = 0;
    for (const note of live) {
      for (const tag of note.tags) {
        try {
          if (normalizeTag(tag) !== tag) oddTags += 1;
        } catch {
          oddTags += 1;
        }
      }
    }
    if (oddTags > 0) problems.push(`${oddTags} etiquetas fuera de norma`);

    const tags = new Set(live.flatMap((note) => note.tags));
    console.log(`${events.length} eventos · ${live.length} notas vivas · ${notes.length - live.length} borradas · ${tags.size} etiquetas`);

    if (problems.length === 0) {
      console.log(s.green("todo en orden"));
      return 0;
    }

    for (const problem of problems) console.log(s.yellow(`- ${problem}`));
    return 1;
  },
};
