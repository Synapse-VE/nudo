import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

test("streaks cuenta la racha actual y la maxima", async () => {
  const { streaks } = await import("../src/stats.js");
  const note = (ts) => ({ ts, tags: [] });
  const now = new Date(2026, 10, 9, 12).getTime();
  const day = 86_400_000;
  const notes = [0, 1, 2].map((offset) => note(now - offset * day));

  const result = streaks(notes, now);
  assert.equal(result.current, 3);
  assert.equal(result.longest, 3);
});

test("streak imprime la racha", async () => {
  const home = tempHome();
  await nudo(home, ["add", "hoy", "--at", daysAgo(0)]);
  await nudo(home, ["add", "ayer", "--at", daysAgo(1)]);

  const { code, stdout } = await nudo(home, ["streak"]);
  assert.equal(code, 0);
  assert.match(stdout, /Racha actual: 2 dias/);
});

test("streak sin notas no falla", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["streak"]);
  assert.equal(code, 0);
  assert.match(stdout, /Todavia no hay notas/);
});

test("streak --json devuelve el objeto", async () => {
  const home = tempHome();
  await nudo(home, ["add", "hoy"]);

  const { stdout } = await nudo(home, ["streak", "--json"]);
  const payload = JSON.parse(stdout);
  assert.equal(payload.current, 1);
});
