import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function addOne(home) {
  const { stdout } = await nudo(home, ["add", "texto original", "-t", "ideas"]);
  return stdout.trim();
}

test("edit reemplaza el texto y conserva las etiquetas", async () => {
  const home = tempHome();
  const id = await addOne(home);

  const { code, stdout } = await nudo(home, ["edit", id, "texto", "corregido"]);
  assert.equal(code, 0);
  assert.match(stdout, /editada/);

  const show = await nudo(home, ["show", id]);
  assert.match(show.stdout, /texto corregido/);
  assert.doesNotMatch(show.stdout, /texto original/);
  assert.match(show.stdout, /ideas/);
});

test("edit acepta el texto por la entrada estandar", async () => {
  const home = tempHome();
  const id = await addOne(home);

  await nudo(home, ["edit", id, "-"], "desde stdin\n");
  const show = await nudo(home, ["show", id]);
  assert.match(show.stdout, /desde stdin/);
});

test("edit rechaza texto vacio e ids inexistentes", async () => {
  const home = tempHome();
  const id = await addOne(home);

  assert.equal((await nudo(home, ["edit", id, "   "])).code, 1);
  assert.equal((await nudo(home, ["edit", "0000", "x"])).code, 1);
  assert.equal((await nudo(home, ["edit"])).code, 1);
});
