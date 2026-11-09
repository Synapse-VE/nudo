/**
 * Modelo de notas.
 *
 * El registro guarda eventos, no el estado final. `fold` los recorre en orden
 * y devuelve las notas vigentes: asi el historial completo queda auditable y
 * cualquier correccion es un evento nuevo.
 */

export const EVENT_VERSION = 1;

/**
 * @typedef {object} Note
 * @property {string} id
 * @property {number} ts
 * @property {string} text
 * @property {string[]} tags
 * @property {Record<string, unknown>} meta
 * @property {boolean} deleted
 * @property {{to: string, label: string}[]} links
 */

/**
 * Aplica un evento sobre el mapa de notas.
 * @param {Map<string, Note>} notes
 * @param {object} event
 */
function apply(notes, event) {
  if (!event || typeof event !== "object" || typeof event.id !== "string") return;

  const existing = notes.get(event.id);

  switch (event.type) {
    case "note": {
      if (existing) return;
      notes.set(event.id, {
        id: event.id,
        ts: Number(event.ts) || 0,
        text: typeof event.text === "string" ? event.text : "",
        tags: Array.isArray(event.tags) ? [...new Set(event.tags)] : [],
        meta: event.meta && typeof event.meta === "object" ? { ...event.meta } : {},
        deleted: false,
        links: [],
      });
      return;
    }

    case "edit": {
      if (!existing || typeof event.text !== "string") return;
      existing.text = event.text;
      return;
    }

    case "tag": {
      if (!existing) return;
      const tags = new Set(existing.tags);
      for (const tag of event.add ?? []) tags.add(tag);
      for (const tag of event.remove ?? []) tags.delete(tag);
      existing.tags = [...tags];
      return;
    }

    case "delete": {
      if (!existing) return;
      existing.deleted = true;
      return;
    }

    case "link": {
      if (!existing || typeof event.to !== "string" || event.to === existing.id) return;
      if (existing.links.some((link) => link.to === event.to)) return;
      existing.links.push({ to: event.to, label: event.label ?? "" });
      return;
    }

    case "unlink": {
      if (!existing) return;
      existing.links = existing.links.filter((link) => link.to !== event.to);
      return;
    }

    default:
      // Eventos de versiones futuras se ignoran en silencio.
      return;
  }
}

/**
 * Reconstruye las notas a partir de los eventos.
 * @param {object[]} events
 * @returns {Note[]} ordenadas por fecha y luego por id
 */
export function fold(events) {
  const notes = new Map();

  const ordered = [...events].sort((a, b) => {
    const byTime = (Number(a?.ts) || 0) - (Number(b?.ts) || 0);
    if (byTime !== 0) return byTime;
    return String(a?.id ?? "") < String(b?.id ?? "") ? -1 : 1;
  });

  for (const event of ordered) apply(notes, event);

  return [...notes.values()];
}

/**
 * Notas vigentes (sin las borradas).
 * @param {object[]} events
 * @returns {Note[]}
 */
export function liveNotes(events) {
  return fold(events).filter((note) => !note.deleted);
}

/**
 * Busca una nota por id, incluidas las borradas.
 * @param {object[]} events
 * @param {string} id
 * @returns {Note | undefined}
 */
export function findNote(events, id) {
  return fold(events).find((note) => note.id === id);
}

/**
 * Busca notas cuyo id empieza con el prefijo dado.
 * @param {Note[]} notes
 * @param {string} prefix
 * @returns {Note[]}
 */
export function resolveId(notes, prefix) {
  const needle = String(prefix).toUpperCase();
  if (needle === "") return [];
  return notes.filter((note) => note.id.startsWith(needle));
}
