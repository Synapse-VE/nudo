import assert from "node:assert/strict";
import { test } from "node:test";

import {
  decodeTime,
  encodeTime,
  isUlid,
  resetUlidState,
  ulid,
} from "../src/id.js";

test.beforeEach(() => resetUlidState());

test("encodeTime produce 10 caracteres base32", () => {
  const encoded = encodeTime(0);
  assert.equal(encoded.length, 10);
  assert.equal(encoded, "0000000000");
  assert.match(encodeTime(Date.now()), /^[0-9A-HJKMNP-TV-Z]{10}$/);
});

test("encodeTime rechaza valores fuera de rango", () => {
  assert.throws(() => encodeTime(-1), RangeError);
  assert.throws(() => encodeTime(2 ** 48), RangeError);
  assert.throws(() => encodeTime(1.5), RangeError);
});

test("el ULID mide 26 caracteres y usa el alfabeto Crockford", () => {
  const id = ulid();
  assert.equal(id.length, 26);
  assert.ok(isUlid(id));
  assert.doesNotMatch(id, /[ILOU]/);
});

test("decodeTime recupera el instante original", () => {
  const now = 1_750_000_000_000;
  assert.equal(decodeTime(ulid(now)), now);
});

test("los ULID del mismo milisegundo son estrictamente crecientes", () => {
  const now = 1_750_000_000_000;
  const ids = Array.from({ length: 1000 }, () => ulid(now));
  for (let i = 1; i < ids.length; i += 1) {
    assert.ok(ids[i] > ids[i - 1], `no crece en ${i}: ${ids[i - 1]} ${ids[i]}`);
  }
  assert.equal(new Set(ids).size, ids.length);
});

test("los ULID de milisegundos distintos mantienen el orden temporal", () => {
  const a = ulid(1_750_000_000_000);
  const b = ulid(1_750_000_000_001);
  assert.ok(a < b);
});

test("isUlid rechaza entradas invalidas", () => {
  assert.equal(isUlid(""), false);
  assert.equal(isUlid("no-es-un-ulid"), false);
  assert.equal(isUlid("01JC00000000000000000000I"), false);
  assert.equal(isUlid(266), false);
  assert.equal(isUlid(null), false);
});
