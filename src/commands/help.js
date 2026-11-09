import { all, get } from "../registry.js";

function general() {
  const lines = ["nudo - tu memoria externa", "", "Uso:", "  nudo <comando> [opciones]", "", "Comandos:"];
  const width = Math.max(...all().map((command) => command.name.length));
  for (const command of all()) {
    lines.push(`  ${command.name.padEnd(width + 2)}${command.summary}`);
  }
  lines.push("", 'Ejecuta "nudo <comando> --help" para ver las opciones de un comando.');
  return lines.join("\n");
}

export default {
  name: "help",
  summary: "Muestra la ayuda general o la de un comando",
  usage: "nudo help [comando]",
  options: {},
  run({ args }) {
    if (args.length === 0) {
      console.log(general());
      return 0;
    }

    const command = get(args[0]);
    if (!command) {
      console.error(`nudo help: no existe el comando "${args[0]}"`);
      return 1;
    }

    console.log(`${command.summary}\n\nUso:\n  ${command.usage}`);
    return 0;
  },
};
