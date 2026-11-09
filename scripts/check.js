#!/usr/bin/env node
/**
 * Verificacion sin dependencias: revisa la sintaxis de todos los .js del repo.
 * La suite de pruebas se corre aparte (`node --test`).
 */
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry.endsWith(".js")) acc.push(full);
  }
  return acc;
}

const directories = ["src", "bin", "test", "scripts"].map((name) => join(ROOT, name));
const files = directories.flatMap((dir) => walk(dir));

let failures = 0;

for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (error) {
    failures += 1;
    console.error(`✖ ${relative(ROOT, file)}`);
    console.error(String(error.stderr ?? error.message).trim());
  }
}

if (failures > 0) {
  console.error(`\n${failures} archivos con errores de sintaxis`);
  process.exit(1);
}

console.log(`sintaxis ok en ${files.length} archivos`);
