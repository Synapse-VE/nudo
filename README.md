# nudo

> Tu memoria externa en la terminal: anota, etiqueta y encuentra.

[![CI](https://github.com/Synapse-VE/nudo/actions/workflows/ci.yml/badge.svg)](https://github.com/Synapse-VE/nudo/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![Dependencias](https://img.shields.io/badge/dependencias-0-blue)](package.json)
[![Licencia](https://img.shields.io/badge/licencia-MIT-green)](LICENSE)

`nudo` guarda notas en un archivo de texto plano, una línea JSON por evento.
No hay base de datos, ni servidor, ni dependencias: si sabes `cat`, sabes leer tu
registro, y si sabes `git`, sabes respaldarlo.

```console
$ nudo add "probar el parser de duraciones" -t nudo -t ideas
01M6PVKNY3TQ4H7X2W8B5C1D0A

$ nudo ls -t nudo
01M6PVKN  2026-11-05 18:00  nudo ideas   Probar el parser de duraciones: 7d, 1h3…
```

## Por qué otro registro mas

Porque las notas no deberian necesitar una cuenta. Todo lo que escribis queda en
`~/.nudo/log.jsonl`, en eventos que se pueden auditar, exportar y versionar. Nada
se borra de verdad: cada correccion es un evento nuevo, y `nudo doctor` te dice
si algo quedo raro.

## Instalacion

Requiere Node 22 o superior.

```console
$ git clone https://github.com/Synapse-VE/nudo.git
$ cd nudo
$ npm link          # deja el comando `nudo` en el PATH
```

Tambien podes correrlo sin instalar nada:

```console
$ node bin/nudo.js help
```

## Uso rapido

```console
# Anotar
$ nudo add "la busqueda tiene que ignorar acentos" -t nudo -t busqueda
$ echo "idea desde la tuberia" | nudo add -

# Buscar y leer
$ nudo search acentos
$ nudo show 01M6RNZB
$ nudo today

# Organizar
$ nudo tag 01M6RNZB +pendiente --remove busqueda
$ nudo link 01M6WE4J 01M6XQAX --label "depende de"
$ nudo graph 01M6WE4J

# Medir
$ nudo stats
$ nudo stats --by day --days 30
$ nudo streak

# Sacar los datos
$ nudo export --format md --out notas.md
$ nudo export --format csv | mlr --icsv --opprint cat
$ nudo ls --json | jq '.[].text'
```

Asi se ve `nudo stats` con los datos de ejemplo (`nudo demo`):

```
Etiquetas
nudo       ████████████████  4
ideas      ████████████░░░░  3
blog       ████░░░░░░░░░░░░  1
busqueda   ████░░░░░░░░░░░░  1
docs       ████░░░░░░░░░░░░  1
9 notas vivas · 0 borradas · 9 etiquetas
```

## Comandos

| Comando | Para que |
| --- | --- |
| `add` | Agrega una nota (texto, etiquetas y metadatos) |
| `ls` | Lista notas con filtros de etiqueta y fecha |
| `search` | Busca por texto, prefijos y etiquetas |
| `show` | Muestra una nota completa (acepta prefijo del id) |
| `today` | Las notas del dia |
| `edit` | Reemplaza el texto de una nota |
| `tag` | Agrega o quita etiquetas |
| `rm` / `restore` | Borra (logico) y recupera |
| `link` / `graph` | Enlaza notas y explora el grafo |
| `stats` / `streak` | Conteos por etiqueta, mapa de calor y rachas |
| `export` / `import` | Markdown, CSV, JSON y JSONL de ida y vuelta |
| `config` | Ajustes persistentes (`limit`, `color`) |
| `doctor` | Revisa la integridad del registro |
| `completion` | Autocompletado para bash, zsh y fish |
| `demo` | Carga notas de ejemplo |

La referencia completa, con todas las opciones, esta en [docs/comandos.md](docs/comandos.md)
y el tutorial paso a paso en [docs/guia.md](docs/guia.md).

## El registro es un archivo

Cada linea de `~/.nudo/log.jsonl` es un evento:

```json
{"v":1,"id":"01M6RNZBQ0...","ts":1762354800000,"type":"note","text":"La busqueda tiene que ignorar acentos","tags":["nudo","busqueda"],"meta":{}}
{"v":1,"id":"01M6RNZBQ0...","ts":1762355000000,"type":"tag","add":["pendiente"],"remove":["busqueda"]}
```

Los tipos de evento son `note`, `edit`, `tag`, `delete`, `restore`, `link` y
`unlink`. El estado se reconstruye plegando los eventos en orden, asi que el
historial entero es legible y cualquier error se corrige agregando un evento.

## Configuracion

```console
$ nudo config set limit 30   # cuantas notas muestra ls
$ nudo config set color never
$ nudo config                # ver todo
```

Variables de entorno: `NUDO_HOME` (carpeta del registro, por defecto `~/.nudo`),
`NO_COLOR` y `FORCE_COLOR`.

## Desarrollo

Sin dependencias: alcanza con Node.

```console
$ npm test      # node --test
$ npm run check # verifica sintaxis y corre la suite
```

## English

**nudo** is a tiny, dependency-free note journal for the terminal. Notes live in
a plain JSONL file (`~/.nudo/log.jsonl`), every change is an event, and the whole
tool is a few hundred lines of JavaScript. `nudo add "text" -t tag`,
`nudo search term`, `nudo stats`, `nudo export --format md`.

## Licencia

MIT. Hecho con cariño desde Venezuela.
