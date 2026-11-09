import { UsageError } from "../errors.js";
import { readConfig, setSetting, unsetSetting, validateSetting } from "../config.js";
import { table } from "../render.js";
import { styles } from "../theme.js";

const ACTIONS = ["get", "set", "unset"];

export default {
  name: "config",
  summary: "Lee y escribe la configuracion",
  usage: "nudo config [get <clave>] | [set <clave> <valor>] | [unset <clave>]",
  options: {},
  run({ args }) {
    const [action, key, value] = args;

    if (!action) {
      const config = readConfig();
      const rows = Object.entries(config).map(([name, current]) => [name, String(current)]);
      console.log(table(rows, { align: ["left", "right"] }));
      return 0;
    }

    if (!ACTIONS.includes(action)) {
      throw new UsageError(`accion desconocida "${action}" (usa ${ACTIONS.join(", ")})`);
    }

    if (action === "get") {
      if (!key) throw new UsageError("falta la clave");
      const config = readConfig();
      if (!(key in config)) {
        console.error(`no existe la clave "${key}"`);
        return 1;
      }
      console.log(String(config[key]));
      return 0;
    }

    if (action === "set") {
      if (!key || value === undefined) throw new UsageError("falta la clave o el valor");
      let normalized;
      try {
        normalized = validateSetting(key, value);
      } catch (error) {
        throw new UsageError(error.message);
      }
      setSetting(key, normalized);
      console.log(`${key} = ${normalized}`);
      return 0;
    }

    if (!key) throw new UsageError("falta la clave");
    unsetSetting(key);
    console.log(`${key} volvio al valor por defecto`);
    return 0;
  },
};
