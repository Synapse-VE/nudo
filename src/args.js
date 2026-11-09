import { UsageError } from "./errors.js";

/**
 * Parser de argumentos minimo, sin dependencias.
 *
 * Cada comando declara sus opciones y `parseArgs` devuelve los valores ya
 * convertidos. Los argumentos sueltos quedan en `positionals`.
 *
 * @param {string[]} argv
 * @param {Record<string, {type?: "string"|"number"|"boolean"|"multi", short?: string, default?: unknown}>} spec
 * @returns {{options: Record<string, any>, positionals: string[]}}
 */
export function parseArgs(argv, spec = {}) {
  const flags = new Map();

  for (const [name, definition] of Object.entries(spec)) {
    flags.set(`--${name}`, { name, ...definition });
    if (definition.short) flags.set(`-${definition.short}`, { name, ...definition });
  }

  /** @type {Record<string, any>} */
  const options = {};
  for (const [name, definition] of Object.entries(spec)) {
    if (definition.type === "multi") options[name] = [];
    else if (definition.type === "boolean") options[name] = false;
    else if (definition.default !== undefined) options[name] = definition.default;
  }

  /** @type {string[]} */
  const positionals = [];
  let onlyPositionals = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (onlyPositionals) {
      positionals.push(arg);
      continue;
    }

    if (arg === "--") {
      onlyPositionals = true;
      continue;
    }

    if (!arg.startsWith("-") || arg === "-") {
      positionals.push(arg);
      continue;
    }

    const equals = arg.indexOf("=");
    const flag = equals === -1 ? arg : arg.slice(0, equals);
    const inline = equals === -1 ? undefined : arg.slice(equals + 1);
    const definition = flags.get(flag);

    if (!definition) {
      throw new UsageError(`opcion desconocida: ${flag}`);
    }

    if (definition.type === "boolean") {
      if (inline !== undefined) {
        throw new UsageError(`la opcion ${flag} no lleva valor`);
      }
      options[definition.name] = true;
      continue;
    }

    const raw = inline ?? argv[i + 1];
    if (raw === undefined) {
      throw new UsageError(`falta el valor de ${flag}`);
    }
    if (inline === undefined) i += 1;

    if (definition.type === "number") {
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new UsageError(`${flag} espera un numero, recibi "${raw}"`);
      }
      options[definition.name] = value;
    } else if (definition.type === "multi") {
      options[definition.name].push(raw);
    } else {
      options[definition.name] = raw;
    }
  }

  return { options, positionals };
}
