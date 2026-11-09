import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("doctor dice todo en orden con un registro sano", async () => {
  const home = tempHome();
  await nudo(home, ["add", "una nota", "-t", "ideas"]);

  const { code, stdout } = await nudo(home, ["doctor"]);
  assert.equal(code, 0);
  assert.match(stdout, /todo en orden/);
});

test("doctor detecta enlaces rotos", async () => {
  const home = tempHome();
  const a = (await nudo(home, ["add", "A"])).stdout.trim();
  const b = (await nudo(home, ["add", "B"])).stdout.trim();
  await nudo(home, ["link", a, b]);
  await nudo(home, ["rm", b, "--hard"]);

  const { code, stdout } = await nudo(home, ["doctor"]);
  assert.equal(code, 1);
  assert.match(stdout, /1 enlaces rotos/);
});

test("doctor detecta lineas corruptas", async () => {
  const home = tempHome();
  await nudo(home, ["add", "ok"]);
  writeFileSync(join(home, "log.jsonl"), '{"id":"A","type":"note"}\n{roto\n');

  const { code, stderr } = await nudo(home, ["doctor"]);
  assert.equal(code, 1);
  assert.match(stderr, /corrupto/);
});

test("doctor funciona sin registro", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["doctor"]);
  assert.equal(code, 0);
  assert.match(stdout, /Todavia no hay registro/);
});
