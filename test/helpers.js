import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const BIN = fileURLToPath(new URL("../bin/nudo.js", import.meta.url));

/**
 * Crea una carpeta temporal para usar como NUDO_HOME.
 * @returns {string}
 */
export function tempHome() {
  return mkdtempSync(join(tmpdir(), "nudo-test-"));
}

/**
 * Ejecuta la CLI y devuelve codigo, stdout y stderr.
 * @param {string} home
 * @param {string[]} args
 * @param {string} [input]
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export function nudo(home, args, input = "") {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [BIN, ...args], {
      env: { ...process.env, NUDO_HOME: home, NO_COLOR: "1", TZ: "UTC" },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));

    child.stdin.end(input);
  });
}
