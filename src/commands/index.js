import { register } from "../registry.js";

import add from "./add.js";
import help from "./help.js";
import ls from "./ls.js";
import version from "./version.js";

export const builtins = [add, help, ls, version];

for (const command of builtins) register(command);
