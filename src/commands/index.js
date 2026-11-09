import { register } from "../registry.js";

import add from "./add.js";
import edit from "./edit.js";
import help from "./help.js";
import ls from "./ls.js";
import search from "./search.js";
import stats from "./stats.js";
import streak from "./streak.js";
import tag from "./tag.js";
import rm from "./rm.js";
import show from "./show.js";
import version from "./version.js";

export const builtins = [add, edit, help, ls, rm, search, show, stats, streak, tag, version];

for (const command of builtins) register(command);
