import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const LOG_FILE = "log.jsonl";

/**
 * Carpeta donde vive el registro. Se puede cambiar con NUDO_HOME.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function homeDir(env = process.env) {
  const custom = env.NUDO_HOME?.trim();
  return custom ? custom : join(homedir(), ".nudo");
}

/**
 * Ruta del archivo de eventos.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function logPath(env = process.env) {
  return join(homeDir(env), LOG_FILE);
}

/**
 * Crea la carpeta del registro si no existe.
 * @param {string} path
 */
function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
}

/**
 * Lee todos los eventos del registro.
 *
 * Ignora lineas vacias y falla con un mensaje util si una linea esta corrupta.
 *
 * @param {string} [path]
 * @returns {object[]}
 */
export function readEvents(path = logPath()) {
  if (!existsSync(path)) return [];

  let raw = readFileSync(path, "utf8");
  // Un editor con BOM rompe la primera linea; lo descartamos.
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const events = [];

  for (const [index, line] of raw.split("\n").entries()) {
    const text = line.trim();
    if (text === "") continue;

    try {
      events.push(JSON.parse(text));
    } catch {
      throw new SyntaxError(`linea ${index + 1} corrupta en ${path}`);
    }
  }

  return events;
}

/**
 * Agrega un evento al final del registro.
 * @param {object} event
 * @param {string} [path]
 */
export function appendEvent(event, path = logPath()) {
  ensureParent(path);
  appendFileSync(path, `${JSON.stringify(event)}\n`, { mode: 0o600 });
}

/**
 * Reescribe el registro completo de forma atomica (archivo temporal + rename).
 * @param {object[]} events
 * @param {string} [path]
 */
export function rewriteEvents(events, path = logPath()) {
  ensureParent(path);

  const body = events.map((event) => JSON.stringify(event)).join("\n");
  const tmp = `${path}.tmp-${process.pid}`;

  writeFileSync(tmp, events.length > 0 ? `${body}\n` : "", { mode: 0o600 });
  renameSync(tmp, path);
}
