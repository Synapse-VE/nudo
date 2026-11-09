import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

function fixture(name) {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}

test("la ayuda general coincide con la referencia", async () => {
  const home = tempHome();
  const { stdout } = await nudo(home, ["help"]);
  assert.equal(stdout, fixture("help.txt"));
});

test("la tabla de configuracion coincide con la referencia", async () => {
  const home = tempHome();
  const { stdout } = await nudo(home, ["config"]);
  assert.equal(stdout, fixture("config.txt"));
});
