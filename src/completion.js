import { all } from "./registry.js";
import "./commands/index.js";

function commandList() {
  return all().map((command) => command.name);
}

/**
 * Genera el script de autocompletado para bash.
 * @returns {string}
 */
export function bash() {
  const names = commandList().join(" ");
  return `# nudo: completado para bash
_nudo() {
  local cur
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"

  if [ "\$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=( \$(compgen -W "${names}" -- "\$cur") )
    return 0
  fi

  case "\${COMP_WORDS[1]}" in
    add|tag) COMPREPLY=( \$(compgen -W "-t -m --at" -- "\$cur") ) ;;
    ls|search|export) COMPREPLY=( \$(compgen -W "-t --since --until --limit --json" -- "\$cur") ) ;;
    *) COMPREPLY=() ;;
  esac
}
complete -F _nudo nudo
`;
}

/**
 * Genera el script de autocompletado para zsh.
 * @returns {string}
 */
export function zsh() {
  const entries = all()
    .map((command) => `    '${command.name}:${command.summary.replace(/'/g, "")}'`)
    .join("\n");

  return `#compdef nudo
# nudo: completado para zsh
_nudo() {
  local -a commands
  commands=(
${entries}
  )

  if (( CURRENT == 2 )); then
    _describe 'comando' commands
    return
  fi

  _arguments \\
    '(-t --tag)'{-t,--tag}'[etiqueta]:etiqueta:' \\
    '--since[fecha de inicio]:cuando:' \\
    '--until[fecha de fin]:cuando:' \\
    '--limit[numero de resultados]:n:' \\
    '--json[salida en json]'
}
compdef _nudo nudo
`;
}

/**
 * Genera el script de autocompletado para fish.
 * @returns {string}
 */
export function fish() {
  const lines = ["# nudo: completado para fish", "complete -c nudo -f"];
  for (const command of all()) {
    lines.push(
      `complete -c nudo -n "__fish_use_subcommand" -a "${command.name}" -d "${command.summary.replace(/"/g, "")}"`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export const SHELLS = { bash, zsh, fish };
