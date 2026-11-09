import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("demo carga notas y enlaces", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["demo"]);
  assert.equal(code, 0);
  assert.match(stdout, /9 notas de ejemplo/);

  const ls = await nudo(home, ["ls", "--limit", "50"]);
  assert.match(ls.stdout, /parser de duraciones/);
  assert.match(ls.stdout, /guia de uso/);

  const graph = await nudo(home, ["graph"]);
  assert.match(graph.stdout, /2 enlaces/);
});

test("demo no pisa un registro con notas salvo con --force", async () => {
  const home = tempHome();
  await nudo(home, ["add", "mia"]);

  const blocked = await nudo(home, ["demo"]);
  assert.equal(blocked.code, 2);
  assert.match(blocked.stderr, /ya tiene notas/);

  const forced = await nudo(home, ["demo", "--force"]);
  assert.equal(forced.code, 0);
});

test("doctor queda conforme con los datos de demo", async () => {
  const home = tempHome();
  await nudo(home, ["demo"]);

  const { code, stdout } = await nudo(home, ["doctor"]);
  assert.equal(code, 0);
  assert.match(stdout, /todo en orden/);
});
