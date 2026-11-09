const ANSI_RE = /\u001b\[[0-9;]*m/g;

const CODES = {
  bold: "1",
  dim: "2",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  gray: "90",
};

/**
 * Decide si conviene usar color.
 * @param {NodeJS.ProcessEnv} [env]
 * @param {{isTTY?: boolean}} [stream]
 * @returns {boolean}
 */
export function useColor(env = process.env, stream = process.stdout) {
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== "") return false;
  if (env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== "" && env.FORCE_COLOR !== "0") return true;
  return Boolean(stream?.isTTY);
}

/**
 * Crea el juego de estilos. Con el color apagado, todo devuelve el texto tal cual.
 * @param {boolean} enabled
 */
export function style(enabled) {
  /** @type {Record<string, (text: string) => string>} */
  const styles = {};

  for (const [name, code] of Object.entries(CODES)) {
    styles[name] = enabled
      ? (text) => `\u001b[${code}m${text}\u001b[0m`
      : (text) => String(text);
  }

  return styles;
}

/**
 * Quita las secuencias ANSI.
 * @param {string} text
 * @returns {string}
 */
export function stripAnsi(text) {
  return String(text).replace(ANSI_RE, "");
}

const WIDE = [
  [0x1100, 0x115f],
  [0x2e80, 0xa4cf],
  [0xac00, 0xd7a3],
  [0xf900, 0xfaff],
  [0xfe30, 0xfe6f],
  [0xff00, 0xff60],
  [0xffe0, 0xffe6],
  [0x1f300, 0x1f64f],
  [0x1f900, 0x1f9ff],
  [0x20000, 0x3fffd],
];

function isWide(codePoint) {
  return WIDE.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function isZeroWidth(codePoint) {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x200b && codePoint <= 0x200f) ||
    (codePoint >= 0xfe00 && codePoint <= 0xfe0f)
  );
}

/**
 * Ancho visible de una cadena, ignorando ANSI y contando los caracteres anchos.
 * @param {string} text
 * @returns {number}
 */
export function width(text) {
  let total = 0;
  for (const char of stripAnsi(text)) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (isZeroWidth(codePoint)) continue;
    total += isWide(codePoint) ? 2 : 1;
  }
  return total;
}

/**
 * Rellena a la derecha segun el ancho visible.
 * @param {string} text
 * @param {number} size
 */
export function padEnd(text, size) {
  return String(text) + " ".repeat(Math.max(0, size - width(text)));
}

/**
 * Rellena a la izquierda segun el ancho visible.
 * @param {string} text
 * @param {number} size
 */
export function padStart(text, size) {
  return " ".repeat(Math.max(0, size - width(text))) + String(text);
}

/**
 * Arma una tabla de texto alineada.
 * @param {string[][]} rows
 * @param {{align?: ("left"|"right")[], gap?: number}} [options]
 * @returns {string}
 */
export function table(rows, { align = [], gap = 2 } = {}) {
  if (rows.length === 0) return "";

  const widths = [];
  for (const row of rows) {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index] ?? 0, width(cell));
    });
  }

  return rows
    .map((row) =>
      row
        .map((cell, index) => (align[index] === "right" ? padStart(cell, widths[index]) : padEnd(cell, widths[index])))
        .join(" ".repeat(gap))
        .trimEnd(),
    )
    .join("\n");
}

const FULL = "█";
const EMPTY = "░";

/**
 * Barra proporcional.
 * @param {number} value
 * @param {number} max
 * @param {number} [size]
 * @returns {string}
 */
export function bar(value, max, size = 20) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(ratio * size);
  return FULL.repeat(filled) + EMPTY.repeat(size - filled);
}
