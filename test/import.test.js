import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { parseJsonl, parseMarkdown, parseNotesJson } from "../src/import.js";
import { nudo, tempHome } from "./helpers.js";

test("parseMarkdown lee encabezados, horas y etiquetas", () => {
  const { notes, errors } = parseMarkdown(`# nudo

## 2026-11-01

- **09:30** · primera idea · \`ideas\`
- segunda sin hora
`);
  assert.equal(errors.length, 0);
  assert.equal(notes.length, 2);
  assert.equal(notes[0].text, "primera idea");
  assert.deepEqual(notes[0].tags, ["ideas"]);
  assert.equal(new Date(notes[0].ts).getHours(), 9);
  assert.equal(notes[1].tags.length, 0);
});

test("parseJsonl separa eventos validos de errores", () => {
  const { events, errors } = parseJsonl('{"id":"A","type":"note"}\nroto\n{"type":"note"}\n');
  assert.equal(events.length, 1);
  assert.equal(errors.length, 2);
});

test("parseNotesJson acepta listas de notas", () => {
  const { notes } = parseNotesJson('[{"text":"hola","tags":["x"]},{"sin":"texto"}]');
  assert.equal(notes.length, 1);
  assert.deepEqual(notes[0].tags, ["x"]);
});

test("import agrega notas de markdown y evita duplicados", async () => {
  const home = tempHome();
  const file = join(home, "notas.md");
  writeFileSync(file, "## 2026-11-01\n- **10:00** hola mundo · `saludo`\n");

  const first = await nudo(home, ["import", file]);
  assert.equal(first.code, 0);
  assert.match(first.stdout, /importadas 1 notas/);

  const second = await nudo(home, ["import", file]);
  assert.match(second.stdout, /importadas 0 notas \(1 omitidas\)/);

  const ls = await nudo(home, ["ls"]);
  assert.match(ls.stdout, /hola mundo/);
});

test("import --dry-run no escribe nada", async () => {
  const home = tempHome();
  const file = join(home, "notas.json");
  writeFileSync(file, JSON.stringify([{ text: "una nota", tags: [] }]));

  const { stdout } = await nudo(home, ["import", file, "--dry-run"]);
  assert.match(stdout, /se importarian 1 notas/);
  assert.match((await nudo(home, ["ls"])).stdout, /No hay notas/);
});

test("import falla con archivos raros o inexistentes", async () => {
  const home = tempHome();
  assert.equal((await nudo(home, ["import", join(home, "x.txt")])).code, 2);
  assert.equal((await nudo(home, ["import", join(home, "no-existe.md")])).code, 1);
});
