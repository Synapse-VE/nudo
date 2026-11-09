import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function oneNote(home) {
  const { stdout } = await nudo(home, ["add", "nota con cuerpo", "-t", "ideas", "-m", "fuente=blog"]);
  return stdout.trim();
}

test("show imprime la nota completa", async () => {
  const home = tempHome();
  const id = await oneNote(home);

  const { code, stdout } = await nudo(home, ["show", id]);
  assert.equal(code, 0);
  assert.match(stdout, new RegExp(id));
  assert.match(stdout, /nota con cuerpo/);
  assert.match(stdout, /ideas/);
  assert.match(stdout, /fuente=blog/);
});

test("show acepta un prefijo del id", async () => {
  const home = tempHome();
  const id = await oneNote(home);

  const { code, stdout } = await nudo(home, ["show", id.slice(0, 10)]);
  assert.equal(code, 0);
  assert.match(stdout, /nota con cuerpo/);
});

test("show falla si no existe", async () => {
  const home = tempHome();
  const { code, stderr } = await nudo(home, ["show", "0000"]);
  assert.equal(code, 1);
  assert.match(stderr, /no existe/);
});

test("show pide el id", async () => {
  const home = tempHome();
  const { code, stderr } = await nudo(home, ["show"]);
  assert.equal(code, 1);
  assert.match(stderr, /falta el id/);
});
