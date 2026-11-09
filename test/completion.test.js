import assert from "node:assert/strict";
import { test } from "node:test";

import { bash, fish, zsh } from "../src/completion.js";
import { nudo, tempHome } from "./helpers.js";

test("bash incluye todos los comandos y el complete", () => {
  const script = bash();
  assert.match(script, /complete -F _nudo nudo/);
  assert.match(script, /add/);
  assert.match(script, /completion/);
});

test("zsh y fish generan scripts validos", () => {
  assert.match(zsh(), /#compdef nudo/);
  assert.match(fish(), /complete -c nudo/);
});

test("completion imprime el script pedido", async () => {
  const home = tempHome();
  const { code, stdout } = await nudo(home, ["completion", "bash"]);
  assert.equal(code, 0);
  assert.match(stdout, /_nudo/);
});

test("completion rechaza shells desconocidos o ausentes", async () => {
  const home = tempHome();
  assert.equal((await nudo(home, ["completion"])).code, 2);
  assert.equal((await nudo(home, ["completion", "powershell"])).code, 2);
});
