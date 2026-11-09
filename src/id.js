import { randomBytes } from "node:crypto";

/** Alfabeto Crockford base32 (sin I, L, O ni U para evitar confusiones). */
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_BYTES = 10;

const TIME_MAX = 2 ** 48 - 1;

let lastTime = 0;
/** @type {Uint8Array | null} */
let lastRandom = null;

/**
 * Codifica un timestamp en base32 Crockford.
 * @param {number} time milisegundos desde la epoca
 * @returns {string} 10 caracteres
 */
export function encodeTime(time) {
  if (!Number.isInteger(time) || time < 0 || time > TIME_MAX) {
    throw new RangeError(`timestamp fuera de rango: ${time}`);
  }

  let value = time;
  let out = "";
  for (let i = 0; i < TIME_LEN; i += 1) {
    const mod = value % ENCODING_LEN;
    out = ENCODING[mod] + out;
    value = (value - mod) / ENCODING_LEN;
  }
  return out;
}

/**
 * Decodifica la parte temporal de un ULID.
 * @param {string} id
 * @returns {number} milisegundos desde la epoca
 */
export function decodeTime(id) {
  if (!isUlid(id)) {
    throw new TypeError(`ULID invalido: ${id}`);
  }

  let time = 0;
  for (const char of id.slice(0, TIME_LEN)) {
    time = time * ENCODING_LEN + ENCODING.indexOf(char);
  }
  return time;
}

/**
 * Convierte 80 bits en 16 caracteres base32.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function encodeRandom(bytes) {
  let out = "";
  let buffer = 0;
  let bits = 0;

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += ENCODING[(buffer >> bits) & 31];
    }
  }

  return out;
}

/**
 * Suma uno al componente aleatorio (big endian).
 * @param {Uint8Array} bytes
 * @returns {Uint8Array | null} null si desborda
 */
function incrementRandom(bytes) {
  const next = Uint8Array.from(bytes);
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i] < 255) {
      next[i] += 1;
      return next;
    }
    next[i] = 0;
  }
  return null;
}

/**
 * Genera un ULID. Dentro del mismo milisegundo los IDs son monótonos.
 * @param {number} [now] instante en milisegundos (util para pruebas)
 * @returns {string} 26 caracteres
 */
export function ulid(now = Date.now()) {
  let time = now;
  /** @type {Uint8Array} */
  let bytes;

  if (lastRandom !== null && time <= lastTime) {
    const bumped = incrementRandom(lastRandom);
    if (bumped) {
      time = lastTime;
      bytes = bumped;
    } else {
      time = lastTime + 1;
      bytes = randomBytes(RANDOM_BYTES);
    }
  } else {
    bytes = randomBytes(RANDOM_BYTES);
  }

  if (time > TIME_MAX) {
    throw new RangeError("se agoto el espacio de timestamps del ULID");
  }

  lastTime = time;
  lastRandom = bytes;
  return encodeTime(time) + encodeRandom(bytes);
}

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/**
 * Indica si una cadena tiene forma de ULID.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isUlid(value) {
  return typeof value === "string" && ULID_RE.test(value);
}

/**
 * Reinicia el estado interno del generador. Solo para pruebas.
 */
export function resetUlidState() {
  lastTime = 0;
  lastRandom = null;
}
