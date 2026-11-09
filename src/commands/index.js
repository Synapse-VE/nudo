import { register } from "../registry.js";

import help from "./help.js";
import version from "./version.js";

export const builtins = [help, version];

for (const command of builtins) register(command);
