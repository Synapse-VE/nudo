import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("config sin argumentos muestra los valores actuales", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["config"]);
  assert.equal(code, 0);
  assert.match(stdout, /limit\s+20/);
  assert.match(stdout, /color\s+auto/);
});

test("config set guarda y config get lee", async () => {
  const home = tempHome();
  const set = await nudo(home, ["config", "set", "limit", "3"]);
  assert.equal(set.code, 0);

  const file = join(home, "config.json");
  assert.equal(JSON.parse(readFileSync(file, "utf8")).limit, 3);
  assert.equal(statSync(file).mode & 0o777, 0o600);

  const get = await nudo(home, ["config", "get", "limit"]);
  assert.equal(get.stdout.trim(), "3");
});

test("el limite configurado se usa en ls", async () => {
  const home = tempHome();
  for (const index of [1, 2, 3]) await nudo(home, ["add", `nota ${index}`]);
  await nudo(home, ["config", "set", "limit", "2"]);

  const { stdout } = await nudo(home, ["ls"]);
  assert.equal(stdout.trim().split("\n").length, 2);
});

test("config unset vuelve al default", async () => {
  const home = tempHome();
  await nudo(home, ["config", "set", "limit", "2"]);
  await nudo(home, ["config", "unset", "limit"]);

  const get = await nudo(home, ["config", "get", "limit"]);
  assert.equal(get.stdout.trim(), "20");
});

test("config rechaza claves y valores invalidos", async () => {
  const home = tempHome();
  assert.equal((await nudo(home, ["config", "set", "nada", "1"])).code, 2);
  assert.equal((await nudo(home, ["config", "set", "limit", "0"])).code, 2);
  assert.equal((await nudo(home, ["config", "set", "color", "rosa"])).code, 2);
  assert.equal((await nudo(home, ["config", "get"])).code, 2);
});
