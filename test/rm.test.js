import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

function log(home) {
  const raw = readFileSync(join(home, "log.jsonl"), "utf8").trim();
  return raw === "" ? [] : raw.split("\n").map((line) => JSON.parse(line));
}

async function addOne(home, text = "para borrar") {
  const { stdout } = await nudo(home, ["add", text]);
  return stdout.trim();
}

test("rm marca la nota como borrada sin tocar el historial", async () => {
  const home = tempHome();
  const id = await addOne(home);

  const { code, stdout } = await nudo(home, ["rm", id]);
  assert.equal(code, 0);
  assert.match(stdout, /borrada/);

  assert.equal(log(home).length, 2);
  assert.equal(log(home)[1].type, "delete");

  const ls = await nudo(home, ["ls"]);
  assert.match(ls.stdout, /No hay notas/);

  const show = await nudo(home, ["show", id]);
  assert.match(show.stdout, /borrada/);
});

test("rm --hard elimina los eventos de la nota", async () => {
  const home = tempHome();
  const id = await addOne(home);

  await nudo(home, ["rm", id, "--hard"]);

  assert.equal(log(home).length, 0);
  const show = await nudo(home, ["show", id]);
  assert.equal(show.code, 1);
});

test("rm avisa si la nota ya estaba borrada", async () => {
  const home = tempHome();
  const id = await addOne(home);

  await nudo(home, ["rm", id]);
  const again = await nudo(home, ["rm", id]);
  assert.equal(again.code, 0);
  assert.match(again.stdout, /ya estaba borrada/);
  assert.equal(log(home).length, 2);
});

test("rm falla con id inexistente o ausente", async () => {
  const home = tempHome();
  assert.equal((await nudo(home, ["rm", "0000"])).code, 1);
  assert.equal((await nudo(home, ["rm"])).code, 1);
});
