import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const BIN = fileURLToPath(new URL("../bin/nudo.js", import.meta.url));

test("version imprime la version del paquete", async () => {
  const { stdout } = await run(process.execPath, [BIN, "version"]);
  assert.match(stdout, /^nudo \d+\.\d+\.\d+\n$/);
});

test("help sale con codigo 0", async () => {
  const { stdout } = await run(process.execPath, [BIN, "help"]);
  assert.match(stdout, /Uso:/);
});

test("un comando desconocido sale con codigo 1", async () => {
  await assert.rejects(
    run(process.execPath, [BIN, "no-existe"]),
    (error) => error.code === 1 && /comando desconocido/.test(error.stderr),
  );
});
