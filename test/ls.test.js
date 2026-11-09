import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function seed(home) {
  await nudo(home, ["add", "comprar cafe", "-t", "casa", "--at", "2026-11-01T10:00:00"]);
  await nudo(home, ["add", "revisar el parser", "-t", "nudo", "-t", "ideas", "--at", "2026-11-02T10:00:00"]);
  await nudo(home, ["add", "otra nota suelta", "--at", "2026-11-03T10:00:00"]);
}

test("ls muestra las notas de la mas nueva a la mas vieja", async () => {
  const home = tempHome();
  await seed(home);

  const { code, stdout } = await nudo(home, ["ls"]);
  assert.equal(code, 0);

  const lines = stdout.trim().split("\n");
  assert.equal(lines.length, 3);
  assert.match(lines[0], /otra nota suelta/);
  assert.match(lines[2], /comprar cafe/);
});

test("ls filtra por etiqueta", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["ls", "-t", "nudo", "-t", "ideas"]);
  assert.match(stdout, /revisar el parser/);
  assert.doesNotMatch(stdout, /comprar cafe/);
});

test("ls filtra por fecha", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["ls", "--since", "2026-11-02"]);
  assert.doesNotMatch(stdout, /comprar cafe/);
  assert.match(stdout, /otra nota suelta/);
});

test("ls respeta --limit y --reverse", async () => {
  const home = tempHome();
  await seed(home);

  const limited = await nudo(home, ["ls", "--limit", "1"]);
  assert.equal(limited.stdout.trim().split("\n").length, 1);
  assert.match(limited.stdout, /otra nota suelta/);

  const reversed = await nudo(home, ["ls", "--reverse", "--limit", "1"]);
  assert.match(reversed.stdout, /comprar cafe/);
});

test("ls avisa cuando no hay notas y no falla con fecha invalida", async () => {
  const home = tempHome();

  const empty = await nudo(home, ["ls"]);
  assert.equal(empty.code, 0);
  assert.match(empty.stdout, /No hay notas/);

  const bad = await nudo(home, ["ls", "--since", "ayer"]);
  assert.equal(bad.code, 2);
  assert.match(bad.stderr, /fecha invalida/);
});

test("ls --group separa por dia con encabezados", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["ls", "--group"]);
  const lines = stdout.trim().split("\n");
  assert.match(lines[0], /^2026-11-03$/);
  assert.match(lines[1], /otra nota suelta/);
  assert.match(stdout, /2026-11-02/);
  assert.match(stdout, /2026-11-01/);
});
