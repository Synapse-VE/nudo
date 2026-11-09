import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("restore devuelve la nota a la vida", async () => {
  const home = tempHome();
  const id = (await nudo(home, ["add", "vuelve"])).stdout.trim();

  await nudo(home, ["rm", id]);
  assert.match((await nudo(home, ["ls"])).stdout, /No hay notas/);

  const restored = await nudo(home, ["restore", id]);
  assert.equal(restored.code, 0);
  assert.match(restored.stdout, /recuperada/);
  assert.match((await nudo(home, ["ls"])).stdout, /vuelve/);
});

test("restore avisa si la nota no estaba borrada", async () => {
  const home = tempHome();
  const id = (await nudo(home, ["add", "viva"])).stdout.trim();

  const { code, stdout } = await nudo(home, ["restore", id]);
  assert.equal(code, 0);
  assert.match(stdout, /no estaba borrada/);
});

test("restore falla con ids inexistentes", async () => {
  const home = tempHome();
  assert.equal((await nudo(home, ["restore", "0000"])).code, 1);
  assert.equal((await nudo(home, ["restore"])).code, 1);
});
