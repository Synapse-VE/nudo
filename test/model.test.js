import assert from "node:assert/strict";
import { test } from "node:test";

import { findNote, fold, liveNotes } from "../src/model.js";

const note = (id, ts, text, tags = []) => ({ v: 1, id, ts, type: "note", text, tags });

test("fold crea una nota por cada evento note", () => {
  const notes = fold([note("A", 1, "hola"), note("B", 2, "mundo")]);
  assert.deepEqual(notes.map((n) => n.id), ["A", "B"]);
  assert.equal(notes[0].text, "hola");
  assert.equal(notes[0].deleted, false);
});

test("fold ordena por fecha y desempata por id", () => {
  const notes = fold([note("C", 2, ""), note("A", 1, ""), note("B", 2, "")]);
  assert.deepEqual(notes.map((n) => n.id), ["A", "B", "C"]);
});

test("edit reemplaza el texto", () => {
  const events = [note("A", 1, "viejo"), { id: "A", ts: 2, type: "edit", text: "nuevo" }];
  assert.equal(fold(events)[0].text, "nuevo");
});

test("tag agrega y quita sin duplicados", () => {
  const events = [
    note("A", 1, "x", ["uno"]),
    { id: "A", ts: 2, type: "tag", add: ["dos", "dos"] },
    { id: "A", ts: 3, type: "tag", remove: ["uno"] },
  ];
  assert.deepEqual(fold(events)[0].tags, ["dos"]);
});

test("delete marca la nota y liveNotes la filtra", () => {
  const events = [note("A", 1, "x"), note("B", 2, "y"), { id: "A", ts: 3, type: "delete" }];
  assert.equal(fold(events)[0].deleted, true);
  assert.deepEqual(liveNotes(events).map((n) => n.id), ["B"]);
  assert.ok(findNote(events, "A"));
});

test("link y unlink administran relaciones", () => {
  const events = [
    note("A", 1, "a"),
    note("B", 2, "b"),
    { id: "A", ts: 3, type: "link", to: "B", label: "depende de" },
    { id: "A", ts: 4, type: "link", to: "B" },
  ];
  assert.deepEqual(fold(events)[0].links, [{ to: "B", label: "depende de" }]);

  const unlinked = fold([...events, { id: "A", ts: 5, type: "unlink", to: "B" }]);
  assert.deepEqual(unlinked[0].links, []);
});

test("los eventos de una nota desconocida no crean nada", () => {
  const events = [{ id: "Z", ts: 1, type: "edit", text: "fantasma" }];
  assert.deepEqual(fold(events), []);
});

test("los eventos desconocidos y las entradas invalidas se ignoran", () => {
  const events = [
    note("A", 1, "x"),
    { id: "A", ts: 2, type: "evento-del-futuro" },
    null,
    { ts: 3, type: "note", text: "sin id" },
    note("A", 4, "duplicado"),
  ];
  const notes = fold(events);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].text, "x");
});

test("una nota nueva con el mismo id no sobrescribe la primera", () => {
  const events = [note("A", 1, "primera"), note("A", 2, "segunda")];
  assert.equal(fold(events)[0].text, "primera");
});
