import assert from "node:assert/strict";
import { test } from "node:test";

import { nudo, tempHome } from "./helpers.js";

async function twoNotes(home) {
  const a = (await nudo(home, ["add", "nota A"])).stdout.trim();
  const b = (await nudo(home, ["add", "nota B"])).stdout.trim();
  return { a, b };
}

test("link enlaza y unlink desenlaza", async () => {
  const home = tempHome();
  const { a, b } = await twoNotes(home);

  const linked = await nudo(home, ["link", a, b, "--label", "depende de"]);
  assert.equal(linked.code, 0);
  assert.match(linked.stdout, /enlazada/);

  const show = await nudo(home, ["show", a]);
  assert.match(show.stdout, /depende de/);

  const removed = await nudo(home, ["link", a, b, "--remove"]);
  assert.match(removed.stdout, /desenlazada/);
  assert.doesNotMatch((await nudo(home, ["show", a])).stdout, /depende de/);
});

test("link evita enlaces repetidos y a si misma", async () => {
  const home = tempHome();
  const { a, b } = await twoNotes(home);

  await nudo(home, ["link", a, b]);
  const again = await nudo(home, ["link", a, b]);
  assert.match(again.stdout, /ya estaban enlazadas/);

  const self = await nudo(home, ["link", a, a]);
  assert.equal(self.code, 1);
  assert.match(self.stderr, /consigo misma/);
});

test("link valida los ids", async () => {
  const home = tempHome();
  const { a } = await twoNotes(home);

  assert.equal((await nudo(home, ["link", a])).code, 1);
  assert.equal((await nudo(home, ["link", a, "0000"])).code, 1);
});
