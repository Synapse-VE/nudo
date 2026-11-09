import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

import {
  appendEvent,
  homeDir,
  logPath,
  readEvents,
  rewriteEvents,
} from "../src/log.js";

const dirs = [];

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), "nudo-log-"));
  dirs.push(dir);
  return dir;
}

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

test("homeDir respeta NUDO_HOME", () => {
  assert.equal(homeDir({ NUDO_HOME: "/tmp/x" }), "/tmp/x");
  assert.equal(homeDir({ NUDO_HOME: "   " }), homeDir({}));
  assert.equal(homeDir({}), join(homedir(), ".nudo"));
});

test("logPath cuelga de homeDir", () => {
  const dir = tempDir();
  assert.equal(logPath({ NUDO_HOME: dir }), join(dir, "log.jsonl"));
});

test("readEvents devuelve una lista vacia si no hay archivo", () => {
  assert.deepEqual(readEvents(join(tempDir(), "nada.jsonl")), []);
});

test("appendEvent y readEvents hacen ida y vuelta", () => {
  const path = join(tempDir(), "log.jsonl");
  appendEvent({ id: "A", type: "note", text: "uno" }, path);
  appendEvent({ id: "B", type: "note", text: "dos" }, path);

  assert.deepEqual(
    readEvents(path).map((event) => event.id),
    ["A", "B"],
  );
});

test("appendEvent crea la carpeta con permisos privados", () => {
  const path = join(tempDir(), "sub", "log.jsonl");
  appendEvent({ id: "A", type: "note", text: "uno" }, path);
  assert.ok(statSync(join(path, "..")).isDirectory());
  assert.equal(readFileSync(path, "utf8"), '{"id":"A","type":"note","text":"uno"}\n');
});

test("readEvents ignora lineas vacias", () => {
  const path = join(tempDir(), "log.jsonl");
  writeFileSync(path, '\n{"id":"A"}\n\n{"id":"B"}\n\n');
  assert.deepEqual(readEvents(path).map((event) => event.id), ["A", "B"]);
});

test("readEvents senala la linea corrupta", () => {
  const path = join(tempDir(), "log.jsonl");
  writeFileSync(path, '{"id":"A"}\n{roto\n');
  assert.throws(() => readEvents(path), /linea 2 corrupta/);
});

test("rewriteEvents reemplaza el contenido", () => {
  const path = join(tempDir(), "log.jsonl");
  appendEvent({ id: "A" }, path);
  appendEvent({ id: "B" }, path);
  rewriteEvents([{ id: "C" }], path);
  assert.deepEqual(readEvents(path), [{ id: "C" }]);
  assert.equal(readFileSync(path, "utf8"), '{"id":"C"}\n');
});

test("rewriteEvents deja un archivo vacio si no hay eventos", () => {
  const path = join(tempDir(), "log.jsonl");
  appendEvent({ id: "A" }, path);
  rewriteEvents([], path);
  assert.equal(readFileSync(path, "utf8"), "");
});
