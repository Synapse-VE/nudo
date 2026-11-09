import { SHELLS } from "../completion.js";
import { UsageError } from "../errors.js";

export default {
  name: "completion",
  summary: "Imprime el script de autocompletado para tu shell",
  usage: "nudo completion <bash|zsh|fish>",
  options: {},
  run({ args }) {
    const [shell] = args;
    const available = Object.keys(SHELLS);

    if (!shell) {
      throw new UsageError(`falta el shell (${available.join(", ")})`);
    }

    const generate = SHELLS[shell];
    if (!generate) {
      throw new UsageError(`shell desconocido "${shell}" (usa ${available.join(", ")})`);
    }

    process.stdout.write(generate());
    return 0;
  },
};
