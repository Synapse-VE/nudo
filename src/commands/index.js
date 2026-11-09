import { register } from "../registry.js";

import add from "./add.js";
import edit from "./edit.js";
import completion from "./completion.js";
import config from "./config.js";
import exportCommand from "./export.js";
import graph from "./graph.js";
import help from "./help.js";
import importCommand from "./import.js";
import link from "./link.js";
import ls from "./ls.js";
import search from "./search.js";
import stats from "./stats.js";
import streak from "./streak.js";
import tag from "./tag.js";
import restore from "./restore.js";
import rm from "./rm.js";
import show from "./show.js";
import version from "./version.js";

export const builtins = [add, completion, config, edit, exportCommand, graph, help, importCommand, link, ls, restore, rm, search, show, stats, streak, tag, version];

for (const command of builtins) register(command);
