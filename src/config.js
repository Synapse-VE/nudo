import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { homeDir } from "./log.js";

export const DEFAULTS = {
  limit: 20,
  color: "auto",
};

const VALIDATORS = {
  limit: (value) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
      throw new TypeError("limit debe ser un entero mayor que cero");
    }
    return number;
  },
  color: (value) => {
    if (!["auto", "always", "never"].includes(value)) {
      throw new TypeError('color debe ser "auto", "always" o "never"');
    }
    return value;
  },
};

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function configPath(env = process.env) {
  return join(homeDir(env), "config.json");
}

/**
 * Lee la configuracion, completando lo que falte con los valores por defecto.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{limit: number, color: string}}
 */
export function readConfig(env = process.env) {
  const path = configPath(env);
  if (!existsSync(path)) return { ...DEFAULTS };

  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    const config = { ...DEFAULTS };
    for (const [key, value] of Object.entries(data ?? {})) {
      try {
        config[key] = VALIDATORS[key](value);
      } catch {
        // Valores invalidos se ignoran y queda el default.
      }
    }
    return config;
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Valida y normaliza un valor antes de guardarlo.
 * @param {string} key
 * @param {string} raw
 * @returns {string | number}
 */
export function validateSetting(key, raw) {
  const validator = VALIDATORS[key];
  if (!validator) {
    throw new TypeError(`clave desconocida "${key}" (validas: ${Object.keys(VALIDATORS).join(", ")})`);
  }
  return validator(raw);
}

/**
 * Guarda un cambio puntual.
 * @param {string} key
 * @param {string | number} value
 * @param {NodeJS.ProcessEnv} [env]
 */
export function setSetting(key, value, env = process.env) {
  const path = configPath(env);
  const current = readConfig(env);
  const next = { ...current, [key]: value };
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
  return next;
}

/**
 * Quita una clave de la configuracion.
 * @param {string} key
 * @param {NodeJS.ProcessEnv} [env]
 */
export function unsetSetting(key, env = process.env) {
  const path = configPath(env);
  const current = readConfig(env);
  delete current[key];
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
  return current;
}
