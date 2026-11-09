# Changelog

Todos los cambios notables de este proyecto se documentan aca. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa
[versionado semantico](https://semver.org/lang/es/).

## [0.2.0] - 2026-11-09

Primera version con la CLI completa.

### Agregado

- Almacen append-only en JSONL con escritura atomica y permisos `0600`.
- Ids ULID ordenables por tiempo, con resolucion por prefijo.
- Comandos: `add`, `ls`, `search`, `show`, `today`, `edit`, `tag`, `rm`,
  `restore`, `link`, `graph`, `stats`, `streak`, `export`, `import`, `config`,
  `doctor`, `completion`, `demo`, `help` y `version`.
- Filtros por etiqueta, fecha relativa y limite; busqueda sin acentos con
  prefijos y orden por relevancia.
- Salida `--json` en los comandos de lectura y exportacion a markdown, CSV y JSON.
- Mapa de calor diario, rachas y conteo por etiqueta.
- Autocompletado para bash, zsh y fish, generado desde el registro de comandos.
- Configuracion persistente (`limit`, `color`) y tema centralizado.
- `doctor` para revisar la integridad del registro.
- Guia de uso y referencia de comandos en `docs/`.
- CI en Node 22, 24 y 26.

### Corregido

- Lectura tolerante a BOM, CRLF y ultima linea sin salto de linea.
- Textos de `--help` que no listaban todas las opciones.

## [0.1.0] - 2026-11-09

### Agregado

- Estructura inicial del paquete, licencia MIT y comando `version`.
