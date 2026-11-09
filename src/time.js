const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const UNIT_MS = {
  s: SECOND,
  m: MINUTE,
  h: HOUR,
  d: DAY,
  w: WEEK,
};

const DURATION_RE = /(\d+(?:\.\d+)?)([smhdw])/g;

/**
 * Convierte una duracion tipo "7d", "1d12h" o "90m" a milisegundos.
 * @param {string} input
 * @returns {number}
 */
export function parseDuration(input) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new TypeError("duracion vacia");
  }

  const text = input.trim().toLowerCase();
  let total = 0;
  let consumed = 0;

  for (const match of text.matchAll(DURATION_RE)) {
    if (match.index !== consumed) {
      throw new SyntaxError(`duracion invalida: ${input}`);
    }
    consumed += match[0].length;
    total += Number(match[1]) * UNIT_MS[match[2]];
  }

  if (consumed !== text.length || total <= 0) {
    throw new SyntaxError(`duracion invalida: ${input}`);
  }

  return Math.round(total);
}

const DURATION_ONLY_RE = /^\d+(?:\.\d+)?(?:[smhdw])+$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?$/;

/**
 * Interpreta un instante escrito por una persona.
 *
 * Acepta duraciones relativas ("7d" = hace siete dias), fechas locales
 * ("2026-11-01") y fechas con hora ("2026-11-01T10:30", "2026-11-01T10:30:00Z").
 *
 * @param {string} input
 * @param {number} [now]
 * @returns {number} milisegundos desde la epoca
 */
export function parseWhen(input, now = Date.now()) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new TypeError("fecha vacia");
  }

  const text = input.trim();

  if (DURATION_ONLY_RE.test(text)) {
    return now - parseDuration(text);
  }

  if (DATE_ONLY_RE.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      throw new SyntaxError(`fecha invalida: ${input}`);
    }
    return date.getTime();
  }

  if (LOCAL_DATETIME_RE.test(text)) {
    const date = new Date(text.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
      throw new SyntaxError(`fecha invalida: ${input}`);
    }
    return date.getTime();
  }

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    throw new SyntaxError(`fecha invalida: ${input}`);
  }
  return parsed;
}

/**
 * Describe un instante en relacion con ahora.
 * @param {number} ts
 * @param {number} [now]
 * @returns {string}
 */
export function relative(ts, now = Date.now()) {
  const delta = now - ts;
  const abs = Math.abs(delta);

  if (abs < 45 * SECOND) return "ahora";

  const future = delta < 0;
  const say = (value, unit) => {
    const phrase = `${value} ${unit}`;
    return future ? `en ${phrase}` : `hace ${phrase}`;
  };

  if (abs < 90 * SECOND) return say(1, "min");
  if (abs < 45 * MINUTE) return say(Math.round(abs / MINUTE), "min");
  if (abs < 90 * MINUTE) return say(1, "h");
  if (abs < 22 * HOUR) return say(Math.round(abs / HOUR), "h");
  if (abs < 36 * HOUR) return future ? "manana" : "ayer";
  if (abs < 30 * DAY) return say(Math.round(abs / DAY), "d");
  if (abs < 365 * DAY) return say(Math.round(abs / (30 * DAY)), "meses").replace("1 meses", "1 mes");
  return say(Math.round(abs / (365 * DAY)), "anos").replace("1 anos", "1 ano");
}

/**
 * Medianoche local del dia que contiene el instante.
 * @param {number} ts
 * @returns {number}
 */
export function startOfDay(ts) {
  const date = new Date(ts);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Dia local en formato YYYY-MM-DD.
 * @param {number} ts
 * @returns {string}
 */
export function formatDay(ts) {
  const date = new Date(ts);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Hora local en formato HH:MM.
 * @param {number} ts
 * @returns {string}
 */
export function formatClock(ts) {
  const date = new Date(ts);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
