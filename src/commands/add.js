import { readFileSync } from "node:fs";

import { UsageError } from "../errors.js";
import { ulid } from "../id.js";
import { appendEvent } from "../log.js";
import { normalizeTags } from "../tags.js";
import { parseWhen } from "../time.js";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parseMeta(pairs) {
  /** @type {Record<string, string>} */
  const meta = {};

  for (const pair of pairs) {
    const equals = pair.indexOf("=");
    if (equals <= 0) {
      throw new UsageError(`metadato invalido: ${pair} (usa clave=valor)`);
    }
    meta[pair.slice(0, equals)] = pair.slice(equals + 1);
  }

  return meta;
}

export default {
  name: "add",
  summary: "Agrega una nota",
  usage: "nudo add <texto...> [-t etiqueta]... [-m clave=valor]... [--at <cuando>]",
  options: {
    tag: { type: "multi", short: "t" },
    meta: { type: "multi", short: "m" },
    at: { type: "string" },
  },
  run({ options, args }) {
    let text;

    if (args.length === 0 || (args.length === 1 && args[0] === "-")) {
      if (process.stdin.isTTY) {
        throw new UsageError("falta el texto de la nota");
      }
      text = readStdin();
    } else {
      text = args.join(" ");
    }

    text = text.trim();
    if (text === "") {
      throw new UsageError("la nota esta vacia");
    }

    let ts = Date.now();
    if (options.at) {
      try {
        ts = parseWhen(options.at);
      } catch (error) {
        throw new UsageError(error.message);
      }
    }

    let tags;
    try {
      tags = normalizeTags(options.tag);
    } catch (error) {
      throw new UsageError(error.message);
    }

    const event = {
      v: 1,
      id: ulid(ts),
      ts,
      type: "note",
      text,
      tags,
      meta: parseMeta(options.meta),
    };

    appendEvent(event);
    console.log(event.id);
    return 0;
  },
};
