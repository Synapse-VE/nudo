import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeTag, normalizeTags } from "../src/tags.js";

test("normaliza mayusculas, almohadillas y espacios", () => {
  assert.equal(normalizeTag("  #Ideas "), "ideas");
  assert.equal(normalizeTag("Dos Palabras"), "dos-palabras");
});

test("acepta acentos y numeros", () => {
  assert.equal(normalizeTag("Programación"), "programación");
  assert.equal(normalizeTag("2026"), "2026");
});

test("rechaza etiquetas invalidas", () => {
  assert.throws(() => normalizeTag(""), TypeError);
  assert.throws(() => normalizeTag("   "), TypeError);
  assert.throws(() => normalizeTag("con/slash"), TypeError);
  assert.throws(() => normalizeTag("-empieza-mal"), TypeError);
  assert.throws(() => normalizeTag("x".repeat(41)), TypeError);
});

test("normalizeTags elimina repetidas y conserva el orden", () => {
  assert.deepEqual(normalizeTags(["B", "a", "b", "#A"]), ["b", "a"]);
});
