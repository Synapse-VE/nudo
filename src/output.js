import { formatClock, formatDay } from "./time.js";
import { table, width as displayWidth } from "./render.js";

/**
 * Recorta un texto al ancho indicado, agregando puntos suspensivos.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function truncate(text, max) {
  if (max <= 0) return "";
  if (displayWidth(text) <= max) return text;

  let out = "";
  for (const char of text) {
    if (displayWidth(out + char) > max - 1) break;
    out += char;
  }
  return `${out}…`;
}

/**
 * Dibuja una lista de notas en columnas.
 * @param {object[]} notes
 * @param {{styles?: Record<string, (t: string) => string>, columns?: number}} [options]
 * @returns {string}
 */
export function noteList(notes, options = {}) {
  const identity = (text) => text;
  const styles = options.styles ?? { dim: identity, cyan: identity };
  const columns = options.columns && options.columns > 40 ? options.columns : 100;
  const textWidth = Math.max(20, columns - 52);

  const rows = notes.map((note) => [
    styles.dim(note.id.slice(0, 8)),
    styles.dim(`${formatDay(note.ts)} ${formatClock(note.ts)}`),
    styles.cyan(note.tags.slice(0, 3).join(" ")),
    truncate(note.text.replace(/\s+/g, " "), textWidth),
  ]);

  return table(rows);
}
