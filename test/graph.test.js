import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("graph lista los enlaces y las notas sueltas", async () => {
  const home = tempHome();
  const a = (await nudo(home, ["add", "nota A"])).stdout.trim();
  const b = (await nudo(home, ["add", "nota B"])).stdout.trim();
  await nudo(home, ["add", "suelta"]);
  await nudo(home, ["link", a, b, "--label", "ver tambien"]);

  const { code, stdout } = await nudo(home, ["graph"]);
  assert.equal(code, 0);
  assert.match(stdout, /->/);
  assert.match(stdout, /ver tambien/);
  assert.match(stdout, /1 notas sueltas/);
});

test("graph sin enlaces avisa", async () => {
  const home = tempHome();
  await nudo(home, ["add", "sola"]);

  const { stdout } = await nudo(home, ["graph"]);
  assert.match(stdout, /Todavia no hay enlaces/);
});

test("graph <id> dibuja el arbol y corta ciclos", async () => {
  const home = tempHome();
  const a = (await nudo(home, ["add", "raiz"])).stdout.trim();
  const b = (await nudo(home, ["add", "hija"])).stdout.trim();

  await nudo(home, ["link", a, b]);
  await nudo(home, ["link", b, a]);

  const { stdout } = await nudo(home, ["graph", a, "--depth", "5"]);
  const occurrences = stdout.split("hija").length - 1;
  assert.equal(occurrences, 1);
});

test("graph --json devuelve las aristas", async () => {
  const home = tempHome();
  const a = (await nudo(home, ["add", "A"])).stdout.trim();
  const b = (await nudo(home, ["add", "B"])).stdout.trim();
  await nudo(home, ["link", a, b]);

  const { stdout } = await nudo(home, ["graph", "--json"]);
  const edges = JSON.parse(stdout);
  assert.deepEqual(edges, [{ from: a, to: b, label: "" }]);
});
