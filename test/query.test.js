import assert from "node:assert/strict";
import { test } from "node:test";

import { filterNotes, fold, searchNotes, tokenize } from "../src/query.js";

const n = (id, ts, text, tags = [], deleted = false) => ({ id, ts, text, tags, deleted, meta: {}, links: [] });

test("fold quita acentos y mayusculas", () => {
  assert.equal(fold("Programación ÁRBOL"), "programacion arbol");
});

test("tokenize separa por signos y descarta vacios", () => {
  assert.deepEqual(tokenize("  hola, mundo!! 42 "), ["hola", "mundo", "42"]);
});

test("filterNotes ordena de mas reciente a mas vieja", () => {
  const notes = [n("a", 1, ""), n("c", 3, ""), n("b", 2, "")];
  assert.deepEqual(filterNotes(notes).map((x) => x.id), ["c", "b", "a"]);
});

test("filterNotes soporta --reverse y --limit", () => {
  const notes = [n("a", 1, ""), n("b", 2, ""), n("c", 3, "")];
  assert.deepEqual(filterNotes(notes, { reverse: true }).map((x) => x.id), ["a", "b", "c"]);
  assert.deepEqual(filterNotes(notes, { limit: 2 }).map((x) => x.id), ["c", "b"]);
});

test("filterNotes exige todas las etiquetas", () => {
  const notes = [n("a", 1, "", ["ideas", "nudo"]), n("b", 2, "", ["ideas"]), n("c", 3, "", ["otra"])];
  assert.deepEqual(filterNotes(notes, { tags: ["ideas", "nudo"] }).map((x) => x.id), ["a"]);
});

test("filterNotes filtra por rango", () => {
  const notes = [n("a", 10, ""), n("b", 20, ""), n("c", 30, "")];
  assert.deepEqual(filterNotes(notes, { since: 15, until: 25 }).map((x) => x.id), ["b"]);
});

test("filterNotes excluye borradas salvo que se pidan", () => {
  const notes = [n("a", 1, "", [], true), n("b", 2, "")];
  assert.deepEqual(filterNotes(notes).map((x) => x.id), ["b"]);
  assert.deepEqual(filterNotes(notes, { includeDeleted: true }).map((x) => x.id), ["b", "a"]);
});

test("searchNotes exige todos los terminos y acepta prefijos", () => {
  const notes = [n("a", 1, "parser de duraciones"), n("b", 2, "parser de fechas"), n("c", 3, "otra cosa")];
  assert.deepEqual(searchNotes(notes, "par dur").map((m) => m.note.id), ["a"]);
  assert.deepEqual(searchNotes(notes, "parser").map((m) => m.note.id).sort(), ["a", "b"]);
});

test("searchNotes ignora acentos y mayusculas", () => {
  const notes = [n("a", 1, "Programación funcional")];
  assert.deepEqual(searchNotes(notes, "PROGRAMACION").map((m) => m.note.id), ["a"]);
});

test("searchNotes encuentra por etiqueta", () => {
  const notes = [n("a", 1, "texto", ["ideas"])];
  assert.deepEqual(searchNotes(notes, "ide").map((m) => m.note.id), ["a"]);
});

test("searchNotes premia lo reciente cuando hay empate", () => {
  const now = 1_000 * 86_400_000;
  const notes = [n("vieja", now - 300 * 86_400_000, "misma palabra"), n("nueva", now - 86_400_000, "misma palabra")];
  assert.equal(searchNotes(notes, "misma", { now })[0].note.id, "nueva");
});

test("searchNotes sin terminos se comporta como filtro", () => {
  const notes = [n("a", 1, "")];
  assert.equal(searchNotes(notes, "   ").length, 1);
});
