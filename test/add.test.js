import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

function events(home) {
  return readFileSync(join(home, "log.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

test("add guarda una nota y devuelve su id", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["add", "primera", "nota"]);

  assert.equal(code, 0);
  const id = stdout.trim();
  assert.match(id, /^[0-9A-Z]{26}$/);

  const [event] = events(home);
  assert.equal(event.id, id);
  assert.equal(event.text, "primera nota");
  assert.equal(event.type, "note");
  assert.deepEqual(event.tags, []);
});

test("add acepta etiquetas y metadatos", async () => {
  const home = tempHome();
  await nudo(home, ["add", "con", "detalles", "-t", "Ideas", "-t", "ideas", "-m", "fuente=blog"]);

  const [event] = events(home);
  assert.deepEqual(event.tags, ["ideas"]);
  assert.deepEqual(event.meta, { fuente: "blog" });
});

test("add lee el texto de la entrada estandar", async () => {
  const home = tempHome();
  const { code } = await nudo(home, ["add", "-"], "desde una tuberia\n");

  assert.equal(code, 0);
  assert.equal(events(home)[0].text, "desde una tuberia");
});

test("add respeta --at", async () => {
  const home = tempHome();
  await nudo(home, ["add", "vieja", "--at", "2026-01-02"]);

  const [event] = events(home);
  assert.equal(new Date(event.ts).toISOString(), "2026-01-02T00:00:00.000Z");
});

test("add falla con texto vacio o metadato invalido", async () => {
  const home = tempHome();

  const empty = await nudo(home, ["add", "   "]);
  assert.equal(empty.code, 2);
  assert.match(empty.stderr, /vacia/);

  const meta = await nudo(home, ["add", "x", "-m", "sinigual"]);
  assert.equal(meta.code, 2);
  assert.match(meta.stderr, /metadato invalido/);
});
