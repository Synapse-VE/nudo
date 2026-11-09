import { UsageError } from "./errors.js";
import { parseArgs } from "./args.js";
import { get } from "./registry.js";
import "./commands/index.js";

export { VERSION } from "./version.js";

/**
 * Ejecuta un comando con sus argumentos.
 * @param {string} name
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
async function dispatch(name, argv) {
  const command = get(name);
  const spec = { ...command.options, help: { type: "boolean", short: "h" } };

  try {
    const { options, positionals } = parseArgs(argv, spec);

    if (options.help) {
      console.log(`${command.summary}\n\nUso:\n  ${command.usage}`);
      return 0;
    }

    return (await command.run({ options, args: positionals })) ?? 0;
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(`nudo ${name}: ${error.message}`);
      console.error(`uso: ${command.usage}`);
      return 2;
    }
    throw error;
  }
}

/**
 * Punto de entrada de la CLI.
 * @param {string[]} argv argumentos sin node ni la ruta del script
 * @returns {Promise<number>} codigo de salida
 */
export async function main(argv = []) {
  const [first, ...rest] = argv;

  if (!first || first === "-h" || first === "--help") {
    return dispatch("help", []);
  }

  if (first === "-v" || first === "--version") {
    return dispatch("version", []);
  }

  if (get(first)) {
    return dispatch(first, rest);
  }

  console.error(`nudo: comando desconocido "${first}"`);
  console.error('Prueba con "nudo help".');
  return 1;
}
