import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function addOne(home, text = "nota") {
  const { stdout } = await nudo(home, ["add", text, "-t", "inicial"]);
  return stdout.trim();
}

test("tag agrega y quita etiquetas", async () => {
  const home = tempHome();
  const id = await addOne(home);

  const added = await nudo(home, ["tag", id, "+ideas", "+Nudo"]);
  assert.equal(added.code, 0);
  assert.match(added.stdout, /inicial ideas nudo/);

  const removed = await nudo(home, ["tag", id, "--remove", "inicial"]);
  assert.match(removed.stdout, /ideas nudo/);
  assert.doesNotMatch(removed.stdout, /inicial/);
});

test("tag acepta prefijos de id", async () => {
  const home = tempHome();
  const id = await addOne(home);

  const { code } = await nudo(home, ["tag", id.slice(0, 8), "+otra"]);
  assert.equal(code, 0);
});

test("tag valida los cambios", async () => {
  const home = tempHome();
  const id = await addOne(home);

  const noSign = await nudo(home, ["tag", id, "ideas"]);
  assert.equal(noSign.code, 2);
  assert.match(noSign.stderr, /argumento invalido/);

  const nothing = await nudo(home, ["tag", id]);
  assert.equal(nothing.code, 2);
  assert.match(nothing.stderr, /no indicaste/);

  const badTag = await nudo(home, ["tag", id, "+con/slash"]);
  assert.equal(badTag.code, 2);

  const missing = await nudo(home, ["tag", "0000", "+x"]);
  assert.equal(missing.code, 1);
});
