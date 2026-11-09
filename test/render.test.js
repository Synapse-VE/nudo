import assert from "node:assert/strict";
import { test } from "node:test";

import { bar, padEnd, padStart, stripAnsi, style, table, useColor, width } from "../src/render.js";

test("useColor respeta NO_COLOR y FORCE_COLOR", () => {
  assert.equal(useColor({ NO_COLOR: "1" }, { isTTY: true }), false);
  assert.equal(useColor({ FORCE_COLOR: "1" }, { isTTY: false }), true);
  assert.equal(useColor({}, { isTTY: false }), false);
  assert.equal(useColor({}, { isTTY: true }), true);
});

test("style no agrega ANSI cuando el color esta apagado", () => {
  const plain = style(false);
  assert.equal(plain.red("hola"), "hola");
});

test("style envuelve el texto cuando el color esta prendido", () => {
  const colored = style(true);
  assert.equal(colored.red("hola"), "\u001b[31mhola\u001b[0m");
  assert.equal(stripAnsi(colored.bold("x")), "x");
});

test("width ignora ANSI y cuenta caracteres anchos", () => {
  assert.equal(width("hola"), 4);
  assert.equal(width("\u001b[31mhola\u001b[0m"), 4);
  assert.equal(width("日本"), 4);
  assert.equal(width("a\u0301"), 1);
});

test("padEnd y padStart usan el ancho visible", () => {
  assert.equal(padEnd("ja", 4), "ja  ");
  assert.equal(padStart("ja", 4), "  ja");
  assert.equal(width(padEnd("日本", 6)), 6);
});

test("table alinea columnas", () => {
  const rendered = table([
    ["nota", "3"],
    ["otra cosa", "12"],
  ]);
  assert.equal(rendered, "nota       3\notra cosa  12");
});

test("table respeta la alineacion a la derecha", () => {
  const rendered = table([["a", "1"], ["bb", "22"]], { align: ["left", "right"] });
  assert.equal(rendered, "a    1\nbb  22");
});

test("bar reparte el llenado", () => {
  assert.equal(bar(0, 10, 5), "░░░░░");
  assert.equal(bar(5, 10, 5), "███░░");
  assert.equal(bar(10, 10, 5), "█████");
  assert.equal(bar(3, 0, 4), "░░░░");
});
