import { appendEvent, readEvents } from "../log.js";
import { fold } from "../model.js";
import { ulid } from "../id.js";
import { UsageError } from "../errors.js";

const DAY = 86_400_000;

const SAMPLE = [
  { days: 4, hour: 9, text: "Arrancar el registro con lo que tengo en la cabeza", tags: ["inicio"] },
  { days: 4, hour: 18, text: "Probar el parser de duraciones: 7d, 1h30m, 2w", tags: ["nudo", "ideas"] },
  { days: 3, hour: 11, text: "La busqueda tiene que ignorar acentos", tags: ["nudo", "busqueda"] },
  { days: 3, hour: 20, text: "Leer sobre el quipu y los nudos incas", tags: ["lecturas"] },
  { days: 2, hour: 8, text: "Exportar a markdown para el blog", tags: ["ideas", "blog"] },
  { days: 2, hour: 22, text: "Anotar la idea de enlazar notas entre si", tags: ["ideas", "nudo"] },
  { days: 1, hour: 10, text: "Repasar el CI: los tests tienen que correr en tres versiones", tags: ["ci"] },
  { days: 1, hour: 19, text: "Que el registro sea un archivo de texto y nada mas", tags: ["nudo", "filosofia"] },
  { days: 0, hour: 9, text: "Escribir la guia de uso con ejemplos reales", tags: ["docs"] },
];

export default {
  name: "demo",
  summary: "Carga notas de ejemplo para probar el registro",
  usage: "nudo demo [--force]",
  options: {
    force: { type: "boolean" },
  },
  run({ options }) {
    const existing = fold(readEvents()).filter((note) => !note.deleted);

    if (existing.length > 0 && !options.force) {
      throw new UsageError("el registro ya tiene notas; usa --force si queres agregar el ejemplo igual");
    }

    const now = Date.now();
    const ids = [];

    for (const sample of SAMPLE) {
      const date = new Date(now - sample.days * DAY);
      date.setHours(sample.hour, 0, 0, 0);
      const event = {
        v: 1,
        id: ulid(date.getTime()),
        ts: date.getTime(),
        type: "note",
        text: sample.text,
        tags: sample.tags,
        meta: { demo: "true" },
      };
      appendEvent(event);
      ids.push(event.id);
    }

    // Dos enlaces para que `graph` tenga algo que mostrar.
    appendEvent({ v: 1, id: ids[2], ts: now, type: "link", to: ids[1], label: "sigue de" });
    appendEvent({ v: 1, id: ids[5], ts: now, type: "link", to: ids[6], label: "relacionado" });

    console.log(`cargadas ${SAMPLE.length} notas de ejemplo (2 enlaces)`);
    console.log('proba: nudo ls -t nudo');
    return 0;
  },
};
