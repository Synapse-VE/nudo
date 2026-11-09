import { formatDay } from "./time.js";

const DAY = 86_400_000;

/**
 * Cuenta notas por etiqueta. Las notas sin etiquetas van a "(sin etiqueta)".
 * @param {object[]} notes
 * @returns {{tag: string, count: number}[]}
 */
export function countByTag(notes) {
  const counts = new Map();

  for (const note of notes) {
    if (note.tags.length === 0) {
      counts.set("(sin etiqueta)", (counts.get("(sin etiqueta)") ?? 0) + 1);
      continue;
    }
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      // El grupo sin etiqueta va siempre al final.
      if (a.tag === "(sin etiqueta)") return 1;
      if (b.tag === "(sin etiqueta)") return -1;
      return b.count - a.count || a.tag.localeCompare(b.tag);
    });
}

/**
 * Cuenta notas por dia local.
 * @param {object[]} notes
 * @returns {Map<string, number>} clave YYYY-MM-DD
 */
export function countByDay(notes) {
  const counts = new Map();

  for (const note of notes) {
    const day = formatDay(note.ts);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return counts;
}

/**
 * Serie diaria de los ultimos `days` dias, incluidos los dias sin notas.
 * @param {object[]} notes
 * @param {{days?: number, now?: number}} [options]
 * @returns {{day: string, count: number}[]}
 */
export function dailySeries(notes, options = {}) {
  const { days = 14, now = Date.now() } = options;
  const counts = countByDay(notes);
  const series = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = formatDay(now - offset * DAY);
    series.push({ day, count: counts.get(day) ?? 0 });
  }

  return series;
}

/**
 * Resumen general del registro.
 * @param {object[]} notes
 */
export function summary(notes) {
  const live = notes.filter((note) => !note.deleted);
  const tags = new Set(live.flatMap((note) => note.tags));

  return {
    total: notes.length,
    live: live.length,
    deleted: notes.length - live.length,
    tags: tags.size,
  };
}

/**
 * Calcula la racha actual y la mas larga de dias consecutivos con notas.
 * @param {object[]} notes
 * @param {number} [now]
 * @returns {{current: number, longest: number, last: string | null}}
 */
export function streaks(notes, now = Date.now()) {
  const days = [...countByDay(notes).keys()].sort();

  if (days.length === 0) {
    return { current: 0, longest: 0, last: null };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    const previous = Date.parse(`${days[i - 1]}T00:00:00`);
    const current = Date.parse(`${days[i]}T00:00:00`);
    run = current - previous === DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const present = new Set(days);
  let cursor = present.has(formatDay(now)) ? now : now - DAY;
  let current = 0;

  while (present.has(formatDay(cursor))) {
    current += 1;
    cursor -= DAY;
  }

  return { current, longest, last: days[days.length - 1] };
}
