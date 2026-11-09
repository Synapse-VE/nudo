import { readFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

export const VERSION = pkg.version;

const USAGE = `nudo ${VERSION} - tu memoria externa

Uso:
  nudo <comando> [opciones]

Comandos:
  help        Muestra esta ayuda
  version     Muestra la version

Ejecuta "nudo help" para ver la lista completa.`;

/**
 * Punto de entrada de la CLI.
 * @param {string[]} argv argumentos sin node ni la ruta del script
 * @returns {Promise<number>} codigo de salida
 */
export async function main(argv = []) {
  const [command] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(USAGE);
    return 0;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    console.log(`nudo ${VERSION}`);
    return 0;
  }

  console.error(`nudo: comando desconocido "${command}"`);
  console.error('Prueba con "nudo help".');
  return 1;
}
