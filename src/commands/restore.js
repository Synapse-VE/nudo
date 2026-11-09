import { appendEvent, readEvents } from "../log.js";
import { fold, resolveId } from "../model.js";

export default {
  name: "restore",
  summary: "Recupera una nota borrada",
  usage: "nudo restore <id>",
  options: {},
  run({ args }) {
    if (!args[0]) {
      console.error("falta el id de la nota");
      return 1;
    }

    const notes = fold(readEvents());
    const matches = resolveId(notes, args[0]);

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

    if (!note.deleted) {
      console.log(`la nota ${short} no estaba borrada`);
      return 0;
    }

    appendEvent({ v: 1, id: note.id, ts: Date.now(), type: "restore" });
    console.log(`recuperada ${short}`);
    return 0;
  },
};
