import { readConfig } from "./config.js";
import { style, useColor } from "./render.js";

/**
 * Estilos listos para usar, segun la configuracion y el entorno.
 * @param {NodeJS.ProcessEnv} [env]
 * @param {{isTTY?: boolean}} [stream]
 */
export function styles(env = process.env, stream = process.stdout) {
  const config = readConfig(env);
  return style(useColor(env, stream, config.color));
}
