# Guia de uso

Esta guia va de cero a un registro que te sirve todos los dias. Cada seccion se
puede leer sola, pero conviene seguir el orden la primera vez.

## 1. La idea

`nudo` no guarda "notas": guarda **eventos**. Cuando escribis una nota, agrega una
linea. Cuando la editas, agrega otra linea que dice "esto paso a ser el texto
nuevo". Cuando la borras, agrega una que dice "borrada".

El estado se arma leyendo el archivo de arriba a abajo. Eso tiene tres
consecuencias practicas:

- Nada se pierde: siempre podes mirar como era antes.
- El archivo es texto: lo lees con `cat`, lo respaldas con `git`, lo procesas con `jq`.
- Si algo se rompe, se arregla agregando un evento, no reescribiendo el pasado.

Todo vive en `~/.nudo/log.jsonl` (o donde diga `NUDO_HOME`).

## 2. Instalacion

Necesitas Node 22 o nuevo.

```console
$ git clone https://github.com/Synapse-VE/nudo.git
$ cd nudo
$ npm link
$ nudo version
```

Si no queres instalarlo, corre `node bin/nudo.js <comando>` desde el repo.

## 3. La primera nota

```console
$ nudo add "arrancar el registro"
01M6NWPXY7Q2R5T8V3W9Z1B4C6
```

`add` imprime el id de la nota. Ese id es la forma de referirse a ella en el
resto de los comandos, y alcanza con el principio:

```console
$ nudo show 01M6NW
```

Si preferis escribir varias lineas, usa la entrada estandar:

```console
$ cat <<'TXT' | nudo add - -t ideas
primera linea
segunda linea
TXT
```

`-t` agrega etiquetas y `-m clave=valor` guarda metadatos:

```console
$ nudo add "charla con Ana sobre el taller" -t personas -m quien=ana
```

## 4. Etiquetas

Las etiquetas se normalizan: minusculas, sin `#`, los espacios pasan a guiones.

```console
$ nudo add "revisar el CI" -t "CI"        # queda como ci
$ nudo tag 01M6NW +pendiente --remove ci
```

Para listar por etiqueta:

```console
$ nudo ls -t pendiente
$ nudo ls -t nudo -t ideas     # las dos a la vez
```

## 5. Encontrar cosas

La busqueda ignora acentos y mayusculas, acepta prefijos y exige que aparezcan
todas las palabras:

```console
$ nudo search acentos
$ nudo search "parser dur"     # parser + cualquier palabra que empiece con dur
```

Se puede acotar por fecha. Las fechas aceptan duraciones relativas (`7d`, `2h`,
`1w`), fechas locales (`2026-11-01`) o con hora (`2026-11-01T10:30`):

```console
$ nudo ls --since 7d
$ nudo search idea --since 2026-11-01 --until 2026-11-05
$ nudo ls --reverse --limit 3   # las tres mas viejas
```

## 6. Editar, borrar y volver atras

```console
$ nudo edit 01M6NW "arrancar el registro, con calma"
$ nudo rm 01M6NW              # borrado logico: la nota desaparece de ls
$ nudo restore 01M6NW         # vuelve
$ nudo rm 01M6NW --hard       # borra todos sus eventos, sin vuelta atras
```

El borrado logico deja el historial intacto; el definitivo reescribe el archivo
sin los eventos de esa nota (y rompe los enlaces que apuntaban a ella, cosa que
`nudo doctor` te va a marcar).

## 7. Enlazar notas

```console
$ nudo link 01M6WE 01M6XQ --label "depende de"
$ nudo graph 01M6WE --depth 3
$ nudo graph                    # todas las aristas y cuantas notas quedan sueltas
```

Los enlaces son dirigidos (de una nota hacia otra) y se deshacen con
`nudo link ... --remove`.

## 8. Medir

```console
$ nudo stats                    # notas por etiqueta
$ nudo stats --by day --days 30 # mapa de calor de los ultimos 30 dias
$ nudo streak                   # racha actual y maxima
$ nudo today
```

La racha actual no se corta hasta que termina el dia: si ayer escribiste y hoy
todavia no, sigue viva.

## 9. Sacar los datos

```console
$ nudo export                          # markdown, agrupado por dia
$ nudo export --format csv --out notas.csv
$ nudo export --format json | jq 'length'
$ nudo ls --json | jq -r '.[] | .text'
```

`import` lee los mismos formatos y evita duplicados:

```console
$ nudo import notas.md --dry-run       # ver que haria
$ nudo import notas.md
```

## 10. Respaldar

Como es un archivo de texto, cualquier respaldo sirve. Con git:

```console
$ cd ~/.nudo && git init && git add log.jsonl && git commit -m "registro"
```

Y un cron que lo suba todas las noches:

```cron
0 3 * * * cd "$HOME/.nudo" && git add log.jsonl && git commit -m "respaldo $(date +\%F)" || true
```

## 11. Configurar

```console
$ nudo config set limit 30       # cuantas notas muestra ls
$ nudo config set color never    # auto | always | never
$ nudo config get limit
$ nudo config unset limit
```

## 12. Recetas

**Anotar rapido desde el shell.** Un alias con una etiqueta fija:

```bash
alias i='nudo add -t inbox'
```

**Revisar el registro antes de confiar en el.** `nudo doctor` verifica ids
repetidos, notas vacias, enlaces rotos y fechas imposibles. Sale con codigo 1 si
encuentra algo.

**Completado.** `nudo completion bash >> ~/.bashrc` (o `zsh`/`fish`).

## 13. Preguntas frecuentes

**¿Puedo tener varios registros?** Si: `NUDO_HOME=~/trabajo nudo ls`.

**¿Se puede sincronizar entre maquinas?** El archivo es texto, asi que si: git,
Syncthing, lo que uses. Ojo con editar el mismo archivo en dos lados a la vez.

**¿Y si el archivo crece mucho?** Es una linea por evento; miles de notas son
unos pocos megabytes y `search` las recorre en milisegundos.

**¿Por que no hay base de datos?** Porque el 90% de las veces un archivo alcanza,
y el archivo lo podes abrir dentro de veinte anios.
