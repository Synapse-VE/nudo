const TAG_RE = /^[\p{L}\p{N}][\p{L}\p{N}._-]*$/u;

/**
 * Normaliza una etiqueta: minusculas, sin "#", espacios a guiones.
 * @param {string} input
 * @returns {string}
 */
export function normalizeTag(input) {
  if (typeof input !== "string") {
    throw new TypeError("la etiqueta debe ser texto");
  }

  const tag = input
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-");

  if (tag === "") {
    throw new TypeError("la etiqueta esta vacia");
  }

  if (tag.length > 40) {
    throw new TypeError(`etiqueta demasiado larga: ${tag}`);
  }

  if (!TAG_RE.test(tag)) {
    throw new TypeError(`etiqueta invalida: ${input}`);
  }

  return tag;
}

/**
 * Normaliza una lista y elimina repetidas conservando el orden.
 * @param {string[]} inputs
 * @returns {string[]}
 */
export function normalizeTags(inputs) {
  return [...new Set(inputs.map(normalizeTag))];
}
