import { register } from "../registry.js";

import add from "./add.js";
import help from "./help.js";
import ls from "./ls.js";
import search from "./search.js";
import show from "./show.js";
import version from "./version.js";

export const builtins = [add, help, ls, search, show, version];

for (const command of builtins) register(command);
