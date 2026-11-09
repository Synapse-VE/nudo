import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function seed(home) {
  await nudo(home, ["add", "primera", "-t", "ideas", "--at", "2026-11-01T09:00:00"]);
  await nudo(home, ["add", "segunda", "--at", "2026-11-01T18:30:00"]);
  await nudo(home, ["add", "tercera", "-t", "nudo", "-m", "fuente=test", "--at", "2026-11-02T10:00:00"]);
}

test("export md agrupa por dia y ordena", async () => {
  const home = tempHome();
  await seed(home);

  const { code, stdout } = await nudo(home, ["export"]);
  assert.equal(code, 0);
  assert.match(stdout, /^# nudo/);
  assert.match(stdout, /## 2026-11-02/);
  assert.match(stdout, /## 2026-11-01/);
  assert.ok(stdout.indexOf("## 2026-11-02") < stdout.indexOf("## 2026-11-01"));
  assert.match(stdout, /`ideas`/);
  assert.match(stdout, /_fuente: test_/);
});

test("export md filtra por etiqueta", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["export", "-t", "nudo"]);
  assert.match(stdout, /tercera/);
  assert.doesNotMatch(stdout, /primera/);
});

test("export --out escribe el archivo", async () => {
  const home = tempHome();
  await seed(home);

  const target = join(home, "salida.md");
  const { code, stdout } = await nudo(home, ["export", "--out", target]);
  assert.equal(code, 0);
  assert.match(stdout, /exportadas 3 notas/);
  assert.match(readFileSync(target, "utf8"), /# nudo/);
});

test("export --format json devuelve las notas", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["export", "--format", "json"]);
  const notes = JSON.parse(stdout);
  assert.equal(notes.length, 3);
  assert.equal(notes[0].text, "primera");
});

test("export csv arma filas con encabezado y escapa comillas", async () => {
  const home = tempHome();
  await nudo(home, ["add", 'dijo "hola", y se fue', "-t", "frases", "--at", "2026-11-01T09:00:00"]);

  const { stdout } = await nudo(home, ["export", "--format", "csv"]);
  const lines = stdout.trim().split("\n");

  assert.equal(lines[0], "id,fecha,hora,etiquetas,texto,meta");
  assert.match(lines[1], /,2026-11-01,09:00,frases,"dijo ""hola"", y se fue",/);
  assert.equal(lines.length, 2);
});

test("export rechaza formatos desconocidos", async () => {
  const home = tempHome();
  const { code } = await nudo(home, ["export", "--format", "pdf"]);
  assert.equal(code, 2);
});
