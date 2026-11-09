/**
 * Lectores de archivos para `nudo import`.
 *
 * Se aceptan tres formatos: JSONL de eventos, JSON con una lista de notas y
 * markdown con encabezados de dia y vinetas.
 */

/**
 * Lee un archivo JSONL de eventos.
 * @param {string} text
 * @returns {{events: object[], errors: string[]}}
 */
export function parseJsonl(text) {
  const events = [];
  const errors = [];

  for (const [index, line] of text.split("\n").entries()) {
    const trimmed = line.trim();
    if (trimmed === "") continue;

    try {
      const event = JSON.parse(trimmed);
      if (!event || typeof event !== "object" || typeof event.id !== "string" || typeof event.type !== "string") {
        errors.push(`linea ${index + 1}: falta id o type`);
        continue;
      }
      events.push(event);
    } catch {
      errors.push(`linea ${index + 1}: JSON invalido`);
    }
  }

  return { events, errors };
}

/**
 * Lee un arreglo JSON de notas.
 * @param {string} text
 * @param {number} [now]
 * @returns {{notes: object[], errors: string[]}}
 */
export function parseNotesJson(text, now = Date.now()) {
  const errors = [];
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    return { notes: [], errors: ["el archivo no es JSON valido"] };
  }

  if (!Array.isArray(data)) {
    return { notes: [], errors: ["se esperaba una lista de notas"] };
  }

  const notes = [];
  for (const [index, item] of data.entries()) {
    if (!item || typeof item.text !== "string") {
      errors.push(`nota ${index + 1}: falta el texto`);
      continue;
    }
    notes.push({
      text: item.text,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      ts: Number(item.ts) || now,
      meta: item.meta && typeof item.meta === "object" ? item.meta : {},
    });
  }

  return { notes, errors };
}

const DAY_HEADER = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/;
const BULLET = /^-\s+(?:\*\*(\d{2}):(\d{2})\*\*\s+(?:·\s+)?)?(.*)$/;

/**
 * Lee markdown con encabezados `## YYYY-MM-DD` y vinetas.
 * @param {string} text
 * @returns {{notes: object[], errors: string[]}}
 */
export function parseMarkdown(text) {
  const notes = [];
  const errors = [];
  let day = null;

  for (const [index, raw] of text.split("\n").entries()) {
    const line = raw.trimEnd();

    const header = line.match(DAY_HEADER);
    if (header) {
      day = header[1];
      continue;
    }

    if (!line.startsWith("- ")) continue;

    const bullet = line.match(BULLET);
    if (!bullet) {
      errors.push(`linea ${index + 1}: vineta invalida`);
      continue;
    }

    const [, hours, minutes, rest] = bullet;
    const parts = rest.split(" · ");
    let tags = [];

    const last = parts[parts.length - 1] ?? "";
    if (/^(?:`[^`]+`\s*)+$/.test(last)) {
      tags = [...last.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
      parts.pop();
    }

    const text = parts.join(" · ").trim();
    if (text === "") {
      errors.push(`linea ${index + 1}: nota sin texto`);
      continue;
    }

    const ts = day
      ? new Date(
          Number(day.slice(0, 4)),
          Number(day.slice(5, 7)) - 1,
          Number(day.slice(8, 10)),
          Number(hours ?? 0),
          Number(minutes ?? 0),
        ).getTime()
      : Date.now();

    notes.push({ text, tags, ts, meta: {} });
  }

  return { notes, errors };
}
