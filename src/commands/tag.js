import { UsageError } from "../errors.js";
import { appendEvent, readEvents } from "../log.js";
import { fold, resolveId } from "../model.js";
import { normalizeTag } from "../tags.js";

function normalizeAll(inputs) {
  try {
    return inputs.map(normalizeTag);
  } catch (error) {
    throw new UsageError(error.message);
  }
}

export default {
  name: "tag",
  summary: "Agrega o quita etiquetas de una nota",
  usage: "nudo tag <id> [+etiqueta]... [--add etiqueta]... [--remove etiqueta]...",
  options: {
    add: { type: "multi", short: "a" },
    remove: { type: "multi", short: "r" },
  },
  run({ options, args }) {
    const [idArg, ...rest] = args;

    if (!idArg) {
      console.error("falta el id de la nota");
      return 1;
    }

    const invalid = rest.find((value) => !value.startsWith("+"));
    if (invalid !== undefined) {
      throw new UsageError(`argumento invalido "${invalid}" (usa +etiqueta o --remove etiqueta)`);
    }

    const add = normalizeAll([...options.add, ...rest.map((value) => value.slice(1))]);
    const remove = normalizeAll(options.remove);

    if (add.length === 0 && remove.length === 0) {
      throw new UsageError("no indicaste etiquetas (usa +etiqueta o --add / --remove)");
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
    appendEvent({ v: 1, id: note.id, ts: Date.now(), type: "tag", add, remove });

    const tags = new Set(note.tags);
    for (const tag of add) tags.add(tag);
    for (const tag of remove) tags.delete(tag);

    const short = note.id.slice(0, 8);
    console.log(tags.size > 0 ? `${short}: ${[...tags].join(" ")}` : `${short}: sin etiquetas`);
    return 0;
  },
};
