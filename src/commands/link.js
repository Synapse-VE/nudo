import { appendEvent, readEvents } from "../log.js";
import { fold, resolveId } from "../model.js";

function resolveOne(notes, value, role) {
  const matches = resolveId(notes, value);
  if (matches.length === 0) {
    console.error(`no existe una nota ${role} con id "${value}"`);
    return null;
  }
  if (matches.length > 1) {
    console.error(`id ambiguo "${value}": coincide con ${matches.length} notas`);
    return null;
  }
  return matches[0];
}

export default {
  name: "link",
  summary: "Enlaza dos notas (y deshace el enlace con --remove)",
  usage: "nudo link <desde> <hacia> [--label <texto>] [--remove]",
  options: {
    label: { type: "string" },
    remove: { type: "boolean" },
  },
  run({ options, args }) {
    const [fromArg, toArg] = args;

    if (!fromArg || !toArg) {
      console.error("faltan las dos notas (desde y hacia)");
      return 1;
    }

    const notes = fold(readEvents());
    const from = resolveOne(notes, fromArg, "origen");
    const to = resolveOne(notes, toArg, "destino");
    if (!from || !to) return 1;

    if (from.id === to.id) {
      console.error("una nota no se puede enlazar consigo misma");
      return 1;
    }

    const shortFrom = from.id.slice(0, 8);
    const shortTo = to.id.slice(0, 8);

    if (options.remove) {
      appendEvent({ v: 1, id: from.id, ts: Date.now(), type: "unlink", to: to.id });
      console.log(`desenlazada ${shortFrom} -/-> ${shortTo}`);
      return 0;
    }

    if (from.links.some((link) => link.to === to.id)) {
      console.log(`ya estaban enlazadas: ${shortFrom} -> ${shortTo}`);
      return 0;
    }

    appendEvent({
      v: 1,
      id: from.id,
      ts: Date.now(),
      type: "link",
      to: to.id,
      label: options.label ?? "",
    });

    console.log(`enlazada ${shortFrom} -> ${shortTo}${options.label ? ` (${options.label})` : ""}`);
    return 0;
  },
};
