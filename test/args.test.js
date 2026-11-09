import assert from "node:assert/strict";
import { test } from "node:test";

import { parseArgs } from "../src/args.js";
import { UsageError } from "../src/errors.js";

const spec = {
  tag: { type: "multi", short: "t" },
  json: { type: "boolean" },
  limit: { type: "number", default: 20 },
  since: { type: "string" },
};

test("separa posicionales y opciones", () => {
  const { options, positionals } = parseArgs(["hola", "mundo", "--json"], spec);
  assert.deepEqual(positionals, ["hola", "mundo"]);
  assert.equal(options.json, true);
});

test("aplica valores por defecto", () => {
  const { options } = parseArgs([], spec);
  assert.equal(options.limit, 20);
  assert.deepEqual(options.tag, []);
  assert.equal(options.json, false);
});

test("acepta --opcion=valor y -corto valor", () => {
  const { options } = parseArgs(["--since=7d", "-t", "ideas", "--limit", "5"], spec);
  assert.equal(options.since, "7d");
  assert.deepEqual(options.tag, ["ideas"]);
  assert.equal(options.limit, 5);
});

test("acumula opciones repetidas", () => {
  const { options } = parseArgs(["-t", "a", "-t", "b"], spec);
  assert.deepEqual(options.tag, ["a", "b"]);
});

test("-- corta el analisis de opciones", () => {
  const { positionals } = parseArgs(["--", "--json", "-t"], spec);
  assert.deepEqual(positionals, ["--json", "-t"]);
});

test("un guion suelto es posicional", () => {
  const { positionals } = parseArgs(["-"], spec);
  assert.deepEqual(positionals, ["-"]);
});

test("rechaza opciones desconocidas", () => {
  assert.throws(() => parseArgs(["--nope"], spec), UsageError);
});

test("rechaza valores faltantes o invalidos", () => {
  assert.throws(() => parseArgs(["--since"], spec), /falta el valor/);
  assert.throws(() => parseArgs(["--limit", "muchas"], spec), /espera un numero/);
  assert.throws(() => parseArgs(["--json=1"], spec), /no lleva valor/);
});
