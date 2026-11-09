import { formatClock, formatDay } from "./time.js";

/**
 * Escapa los caracteres que romperian el markdown.
 * @param {string} text
 * @returns {string}
 */
function escapeMarkdown(text) {
  return text.replace(/([\\`*_{}[\]()#+\-.!|>])/g, "\\$1");
}

/**
 * Agrupa notas por dia local, del dia mas nuevo al mas viejo.
 * @param {object[]} notes
 * @returns {{day: string, notes: object[]}[]}
 */
function groupByDay(notes) {
  /** @type {Map<string, object[]>} */
  const groups = new Map();

  for (const note of [...notes].sort((a, b) => a.ts - b.ts)) {
    const day = formatDay(note.ts);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(note);
  }

  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, entries]) => ({ day, notes: entries }));
}

/**
 * Convierte notas a markdown, agrupadas por dia.
 * @param {object[]} notes
 * @param {number} [now]
 * @returns {string}
 */
export function toMarkdown(notes, now = Date.now()) {
  const groups = groupByDay(notes);
  const lines = [
    "# nudo",
    "",
    `_Exportado el ${formatDay(now)} · ${notes.length} ${notes.length === 1 ? "nota" : "notas"}_`,
    "",
  ];

  for (const group of groups) {
    lines.push(`## ${group.day}`, "");
    for (const note of group.notes) {
      const parts = [`- **${formatClock(note.ts)}**`, escapeMarkdown(note.text)];
      if (note.tags.length > 0) {
        parts.push(note.tags.map((tag) => `\`${tag}\``).join(" "));
      }
      const meta = Object.entries(note.meta);
      if (meta.length > 0) {
        parts.push(meta.map(([key, value]) => `_${key}: ${value}_`).join(" "));
      }
      lines.push(parts.join(" · "));
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
