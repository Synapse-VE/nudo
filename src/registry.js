/** @type {Map<string, any>} */
const commands = new Map();

/**
 * Registra un comando.
 * @param {{name: string, summary: string, usage: string, options?: object, run: Function}} command
 */
export function register(command) {
  commands.set(command.name, command);
}

/**
 * @param {string} name
 */
export function get(name) {
  return commands.get(name);
}

/** @returns {object[]} comandos ordenados por nombre */
export function all() {
  return [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));
}
