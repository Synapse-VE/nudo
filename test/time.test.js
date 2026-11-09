import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatClock,
  formatDay,
  parseDuration,
  parseWhen,
  relative,
  startOfDay,
} from "../src/time.js";

test("parseDuration entiende unidades simples", () => {
  assert.equal(parseDuration("30s"), 30_000);
  assert.equal(parseDuration("5m"), 300_000);
  assert.equal(parseDuration("2h"), 7_200_000);
  assert.equal(parseDuration("7d"), 604_800_000);
  assert.equal(parseDuration("1w"), 604_800_000);
});

test("parseDuration suma unidades compuestas", () => {
  assert.equal(parseDuration("1d12h"), 86_400_000 + 43_200_000);
  assert.equal(parseDuration("1h30m"), 5_400_000);
});

test("parseDuration rechaza basura", () => {
  for (const bad of ["", "   ", "7", "d", "7x", "7d-", "-7d", "0d", "1d 2h"]) {
    assert.throws(() => parseDuration(bad), `deberia fallar: ${JSON.stringify(bad)}`);
  }
});

test("parseWhen interpreta duraciones relativas", () => {
  const now = 1_000_000_000_000;
  assert.equal(parseWhen("7d", now), now - 604_800_000);
  assert.equal(parseWhen("2h", now), now - 7_200_000);
});

test("parseWhen interpreta fechas locales", () => {
  const expected = new Date(2026, 10, 1).getTime();
  assert.equal(parseWhen("2026-11-01"), expected);
  assert.equal(parseWhen("2026-11-01T10:30"), expected + 10.5 * 3_600_000);
});

test("parseWhen rechaza fechas imposibles", () => {
  assert.throws(() => parseWhen("2026-02-30"), SyntaxError);
  assert.throws(() => parseWhen("ayer"), SyntaxError);
  assert.throws(() => parseWhen(""), TypeError);
});

test("relative describe el pasado y el futuro", () => {
  const now = 1_000_000_000_000;
  assert.equal(relative(now - 5_000, now), "ahora");
  assert.equal(relative(now - 5 * 60_000, now), "hace 5 min");
  assert.equal(relative(now - 3 * 3_600_000, now), "hace 3 h");
  assert.equal(relative(now - 3 * 86_400_000, now), "hace 3 d");
  assert.equal(relative(now + 2 * 3_600_000, now), "en 2 h");
});

test("startOfDay y formatDay trabajan en hora local", () => {
  const ts = new Date(2026, 10, 9, 15, 42, 7).getTime();
  assert.equal(formatDay(ts), "2026-11-09");
  assert.equal(formatClock(ts), "15:42");
  assert.equal(startOfDay(ts), new Date(2026, 10, 9).getTime());
});
