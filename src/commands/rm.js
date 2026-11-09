import { appendEvent, readEvents, rewriteEvents } from "../log.js";
import { fold, resolveId } from "../model.js";

export default {
  name: "rm",
  summary: "Borra una nota (logico por defecto, definitivo con --hard)",
  usage: "nudo rm <id> [--hard]",
  options: {
    hard: { type: "boolean" },
  },
  run({ options, args }) {
    if (!args[0]) {
      console.error("falta el id de la nota");
      return 1;
    }

    const events = readEvents();
    const matches = resolveId(fold(events), args[0]);

    if (matches.length === 0) {
      console.error(`no existe una nota con id "${args[0]}"`);
      return 1;
    }
    if (matches.length > 1) {
      console.error(`id ambiguo "${args[0]}": coincide con ${matches.length} notas`);
      return 1;
    }

    const [note] = matches;
    const short = note.id.slice(0, 8);

    if (options.hard) {
      rewriteEvents(events.filter((event) => event.id !== note.id));
      console.log(`borrada ${short} (definitivo)`);
      return 0;
    }

    if (note.deleted) {
      console.log(`la nota ${short} ya estaba borrada`);
      return 0;
    }

    appendEvent({ v: 1, id: note.id, ts: Date.now(), type: "delete" });
    console.log(`borrada ${short} (recuperable con "nudo restore")`);
    return 0;
  },
};
