import { VERSION } from "../version.js";

export default {
  name: "version",
  summary: "Muestra la version instalada",
  usage: "nudo version",
  options: {},
  run() {
    console.log(`nudo ${VERSION}`);
    return 0;
  },
};
