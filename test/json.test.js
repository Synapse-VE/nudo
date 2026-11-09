import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function seed(home) {
  await nudo(home, ["add", "primera idea", "-t", "ideas", "-m", "fuente=test"]);
  await nudo(home, ["add", "segunda idea", "-t", "ideas"]);
}

test("ls --json devuelve una lista de notas", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["ls", "--json"]);
  const notes = JSON.parse(stdout);

  assert.equal(notes.length, 2);
  assert.ok(Array.isArray(notes[0].tags));
  assert.equal(notes[1].meta.fuente, "test");
});

test("search --json incluye el puntaje", async () => {
  const home = tempHome();
  await seed(home);

  const { stdout } = await nudo(home, ["search", "idea", "--json"]);
  const notes = JSON.parse(stdout);

  assert.equal(notes.length, 2);
  assert.equal(typeof notes[0].score, "number");
});

test("show --json devuelve la nota completa", async () => {
  const home = tempHome();
  const id = (await nudo(home, ["add", "con detalle", "-t", "x"])).stdout.trim();

  const { stdout } = await nudo(home, ["show", id, "--json"]);
  const note = JSON.parse(stdout);

  assert.equal(note.id, id);
  assert.equal(note.text, "con detalle");
  assert.deepEqual(note.tags, ["x"]);
  assert.deepEqual(note.links, []);
});

test("--json con lista vacia devuelve []", async () => {
  const home = tempHome();
  const { stdout } = await nudo(home, ["ls", "--json"]);
  assert.deepEqual(JSON.parse(stdout), []);
});
