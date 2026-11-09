import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("today muestra solo las notas de hoy", async () => {
  const home = tempHome();
  await nudo(home, ["add", "de hoy"]);
  await nudo(home, ["add", "de ayer", "--at", "2026-01-01"]);

  const { code, stdout } = await nudo(home, ["today"]);
  assert.equal(code, 0);
  assert.match(stdout, /Hoy, \d{4}-\d{2}-\d{2}/);
  assert.match(stdout, /de hoy/);
  assert.doesNotMatch(stdout, /de ayer/);
});

test("today avisa cuando el dia esta vacio", async () => {
  const home = tempHome();
  const { stdout } = await nudo(home, ["today"]);
  assert.match(stdout, /Todavia no anotaste nada hoy/);
});

test("today --json devuelve la lista", async () => {
  const home = tempHome();
  await nudo(home, ["add", "una"]);

  const { stdout } = await nudo(home, ["today", "--json"]);
  assert.equal(JSON.parse(stdout).length, 1);
});
