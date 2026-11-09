const DAY = 86_400_000;

/**
 * Pasa a minusculas y quita diacriticos: "Programación" -> "programacion".
 * @param {string} text
 * @returns {string}
 */
export function fold(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Divide un texto en palabras normalizadas.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return fold(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * Filtra notas por etiqueta, rango de fechas y cantidad.
 *
 * @param {object[]} notes
 * @param {{tags?: string[], since?: number, until?: number, limit?: number, reverse?: boolean, includeDeleted?: boolean}} [options]
 * @returns {object[]}
 */
export function filterNotes(notes, options = {}) {
  const {
    tags = [],
    since,
    until,
    limit,
    reverse = false,
    includeDeleted = false,
  } = options;

  let result = notes.filter((note) => includeDeleted || !note.deleted);

  if (tags.length > 0) {
    result = result.filter((note) => tags.every((tag) => note.tags.includes(tag)));
  }
  if (since !== undefined) {
    result = result.filter((note) => note.ts >= since);
  }
  if (until !== undefined) {
    result = result.filter((note) => note.ts <= until);
  }

  result = [...result].sort((a, b) => (reverse ? a.ts - b.ts : b.ts - a.ts));

  if (limit !== undefined) {
    result = result.slice(0, limit);
  }

  return result;
}

/**
 * Busca notas. Todos los terminos deben aparecer; se aceptan prefijos.
 *
 * Devuelve pares nota/puntaje para que el comando decida como mostrarlos.
 *
 * @param {object[]} notes
 * @param {string} query
 * @param {{now?: number, tags?: string[], since?: number, until?: number, limit?: number}} [options]
 * @returns {{note: object, score: number}[]}
 */
export function searchNotes(notes, query, options = {}) {
  const { now = Date.now(), ...filters } = options;
  const terms = tokenize(query);

  if (terms.length === 0) {
    return filterNotes(notes, { ...filters, limit: undefined }).map((note) => ({ note, score: 0 }));
  }

  const matches = [];

  for (const note of filterNotes(notes, { ...filters, limit: undefined })) {
    const words = tokenize(note.text);
    let hits = 0;
    let matchesAll = true;

    for (const term of terms) {
      const inText = words.filter((word) => word.startsWith(term)).length;
      const inTags = note.tags.filter((tag) => fold(tag).startsWith(term)).length;
      const total = inText + inTags;

      if (total === 0) {
        matchesAll = false;
        break;
      }
      hits += total;
    }

    if (!matchesAll) continue;

    const ageDays = Math.max(0, (now - note.ts) / DAY);
    const recency = 2 / (1 + ageDays / 30);

    matches.push({ note, score: hits * 2 + recency });
  }

  matches.sort((a, b) => b.score - a.score || b.note.ts - a.note.ts);

  return filters.limit !== undefined ? matches.slice(0, filters.limit) : matches;
}
