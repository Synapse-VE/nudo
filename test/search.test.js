import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

test("search encuentra por palabra y por prefijo", async () => {
  const home = tempHome();
  await nudo(home, ["add", "parser de duraciones", "-t", "nudo"]);
  await nudo(home, ["add", "comprar pan"]);

  const full = await nudo(home, ["search", "duraciones"]);
  assert.match(full.stdout, /parser de duraciones/);

  const prefix = await nudo(home, ["search", "durar"]);
  assert.match(prefix.stdout, /Sin resultados/);

  const byTag = await nudo(home, ["search", "nudo"]);
  assert.match(byTag.stdout, /parser de duraciones/);
});

test("search exige todos los terminos", async () => {
  const home = tempHome();
  await nudo(home, ["add", "alfa beta gamma"]);

  assert.match((await nudo(home, ["search", "alfa", "beta"])).stdout, /alfa beta gamma/);
  assert.match((await nudo(home, ["search", "alfa", "delta"])).stdout, /Sin resultados/);
});

test("search combina texto y filtros", async () => {
  const home = tempHome();
  await nudo(home, ["add", "idea vieja", "-t", "ideas", "--at", "2026-01-01"]);
  await nudo(home, ["add", "idea nueva", "-t", "ideas", "--at", "2026-06-01"]);

  const { stdout } = await nudo(home, ["search", "idea", "--since", "2026-05-01"]);
  assert.match(stdout, /idea nueva/);
  assert.doesNotMatch(stdout, /idea vieja/);
});

test("search falla sin terminos", async () => {
  const home = tempHome();
  const { code, stderr } = await nudo(home, ["search"]);
  assert.equal(code, 2);
  assert.match(stderr, /falta el texto/);
});
