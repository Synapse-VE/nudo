import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("countByTag suma apariciones y agrupa las notas sin etiqueta", async () => {
  const { countByTag } = await import("../src/stats.js");
  const notes = [
    { tags: ["a", "b"] },
    { tags: ["a"] },
    { tags: [] },
  ];
  assert.deepEqual(countByTag(notes), [
    { tag: "a", count: 2 },
    { tag: "b", count: 1 },
    { tag: "(sin etiqueta)", count: 1 },
  ]);
});

test("stats muestra etiquetas con barras", async () => {
  const home = tempHome();
  await nudo(home, ["add", "una", "-t", "ideas"]);
  await nudo(home, ["add", "dos", "-t", "ideas"]);
  await nudo(home, ["add", "tres", "-t", "nudo"]);

  const { code, stdout } = await nudo(home, ["stats"]);
  assert.equal(code, 0);
  assert.match(stdout, /Etiquetas/);
  assert.match(stdout, /ideas/);
  assert.match(stdout, /3 notas vivas/);
});

test("stats --by day muestra la serie diaria", async () => {
  const home = tempHome();
  await nudo(home, ["add", "hoy"]);

  const { stdout } = await nudo(home, ["stats", "--by", "day", "--days", "3"]);
  const lines = stdout.trim().split("\n");
  assert.match(lines[0], /Ultimos 3 dias/);
  assert.equal(lines.length, 5);
});

test("stats --json devuelve totales y etiquetas", async () => {
  const home = tempHome();
  await nudo(home, ["add", "una", "-t", "ideas"]);

  const { stdout } = await nudo(home, ["stats", "--json"]);
  const payload = JSON.parse(stdout);
  assert.equal(payload.live, 1);
  assert.equal(payload.tags[0].tag, "ideas");
});

test("stats rechaza --by desconocido", async () => {
  const home = tempHome();
  const { code } = await nudo(home, ["stats", "--by", "mes"]);
  assert.equal(code, 2);
});
