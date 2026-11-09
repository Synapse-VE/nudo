import { readFileSync } from "node:fs";

import { resolveId, fold } from "../model.js";
import { appendEvent, readEvents } from "../log.js";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

export default {
  name: "edit",
  summary: "Reemplaza el texto de una nota",
  usage: "nudo edit <id> <texto...>",
  options: {},
  run({ args }) {
    const [idArg, ...rest] = args;

    if (!idArg) {
      console.error("falta el id de la nota");
      return 1;
    }

    let text;
    if (rest.length === 0 || (rest.length === 1 && rest[0] === "-")) {
      if (rest.length === 0 && process.stdin.isTTY) {
        console.error("falta el texto nuevo");
        return 1;
      }
      text = readStdin();
    } else {
      text = rest.join(" ");
    }

    text = text.trim();
    if (text === "") {
      console.error("el texto nuevo esta vacio");
      return 1;
    }

    const notes = fold(readEvents());
    const matches = resolveId(notes, idArg);

    if (matches.length === 0) {
      console.error(`no existe una nota con id "${idArg}"`);
      return 1;
    }
    if (matches.length > 1) {
      console.error(`id ambiguo "${idArg}": coincide con ${matches.length} notas`);
      return 1;
    }

    const [note] = matches;
    appendEvent({ v: 1, id: note.id, ts: Date.now(), type: "edit", text });
    console.log(`editada ${note.id.slice(0, 8)}`);
    return 0;
  },
};
