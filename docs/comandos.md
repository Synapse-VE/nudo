# Referencia de comandos

Convenciones generales:

- Los ids se pueden abreviar: alcanza con el prefijo mientras no sea ambiguo.
- Las fechas aceptan duraciones relativas (`7d`, `12h`, `3w`), fechas locales
  (`2026-11-01`) y fechas con hora (`2026-11-01T10:30`).
- Los comandos que listan aceptan `--json` cuando se indica.
- Codigos de salida: `0` todo bien, `1` error de datos (id inexistente, archivo
  ilegible), `2` error de uso (opcion desconocida, valor invalido).

## add

```
nudo add <texto...> [-t etiqueta]... [-m clave=valor]... [--at <cuando>]
```

| Opcion | Descripcion |
| --- | --- |
| `-t, --tag <etiqueta>` | Etiqueta (repetible) |
| `-m, --meta <clave=valor>` | Metadato (repetible) |
| `--at <cuando>` | Fecha de la nota (por defecto, ahora) |

Sin argumentos, o con `-`, lee la nota de la entrada estandar. Imprime el id.

```console
$ nudo add "idea suelta" -t inbox
$ echo "desde un pipe" | nudo add -
$ nudo add "nota de ayer" --at 2026-11-08T20:00
```

## ls

```
nudo ls [-t etiqueta]... [--since <cuando>] [--until <cuando>] [--limit N] [--reverse] [--json]
```

| Opcion | Descripcion |
| --- | --- |
| `-t, --tag <etiqueta>` | Filtra por etiqueta (todas deben estar) |
| `--since <cuando>` | Desde esa fecha |
| `--until <cuando>` | Hasta esa fecha |
| `--limit N` | Cuantas mostrar (por defecto, `limit` de la configuracion) |
| `--reverse` | De la mas vieja a la mas nueva |
| `--json` | Salida JSON |

## search

```
nudo search <terminos...> [-t etiqueta]... [--since <cuando>] [--until <cuando>] [--limit N] [--json]
```

Todos los terminos deben aparecer; se aceptan prefijos. Ignora acentos y
mayusculas. Ordena por relevancia y, en caso de empate, por fecha.

## show

```
nudo show <id> [--json]
```

Muestra id completo, fecha absoluta y relativa, etiquetas, metadatos, enlaces y
el texto sin recortar.

## today

```
nudo today [--json]
```

Las notas desde la medianoche local.

## edit

```
nudo edit <id> <texto...>
```

Reemplaza el texto. Con `-` lee de la entrada estandar. Conserva etiquetas,
metadatos y enlaces.

## tag

```
nudo tag <id> [+etiqueta]... [--add etiqueta]... [--remove etiqueta]...
```

```console
$ nudo tag 01M6NW +pendiente --remove inbox
```

## rm

```
nudo rm <id> [--hard]
```

Sin `--hard` agrega un evento de borrado (recuperable). Con `--hard` reescribe el
registro sin ningun evento de esa nota.

## restore

```
nudo restore <id>
```

Deshace un borrado logico. No sirve para notas borradas con `--hard`.

## link

```
nudo link <desde> <hacia> [--label <texto>] [--remove]
```

Crea un enlace dirigido. `--remove` lo deshace. Una nota no puede enlazarse
consigo misma.

## graph

```
nudo graph [<id>] [--depth N] [--json]
```

Sin id: todas las aristas y cuantas notas quedan sueltas. Con id: arbol de
enlaces hasta `--depth` niveles (por defecto 3), cortando ciclos.

## stats

```
nudo stats [--by tag|day] [--days N] [--limit N] [--json]
```

| Opcion | Descripcion |
| --- | --- |
| `--by tag` | Conteo por etiqueta (por defecto) |
| `--by day` | Mapa de calor de los ultimos `--days` dias (14 por defecto) |
| `--limit N` | Cuantas etiquetas mostrar (10 por defecto) |

## streak

```
nudo streak [--json]
```

Racha actual de dias consecutivos con al menos una nota y racha maxima historica.
La racha actual incluye ayer si todavia no escribiste hoy.

## export

```
nudo export [--format md|csv|json] [--out <archivo>] [-t etiqueta]... [--since <cuando>] [--until <cuando>]
```

| Formato | Salida |
| --- | --- |
| `md` | Markdown agrupado por dia (por defecto) |
| `csv` | id, fecha, hora, etiquetas, texto, meta |
| `json` | Lista de notas |

Sin `--out` escribe a la salida estandar.

## import

```
nudo import <archivo> [--dry-run]
```

Detecta el formato por extension: `.jsonl` (eventos), `.json` (lista de notas)
o `.md` (encabezados `## YYYY-MM-DD` y vinetas). Omite duplicados por id o por
texto+fecha. `--dry-run` solo informa.

## config

```
nudo config
nudo config get <clave>
nudo config set <clave> <valor>
nudo config unset <clave>
```

| Clave | Valores | Por defecto |
| --- | --- | --- |
| `limit` | entero > 0 | `20` |
| `color` | `auto`, `always`, `never` | `auto` |

## doctor

```
nudo doctor
```

Revisa ids repetidos, notas sin texto, enlaces rotos, eventos desconocidos,
fechas futuras y etiquetas fuera de norma. Sale con `1` si encuentra algo.

## completion

```
nudo completion bash|zsh|fish
```

Imprime el script de autocompletado. Se genera desde el registro de comandos.

## demo

```
nudo demo [--force]
```

Carga nueve notas de ejemplo y dos enlaces. Se niega si el registro ya tiene
notas, salvo con `--force`.

## help y version

```
nudo help [comando]
nudo version
```
