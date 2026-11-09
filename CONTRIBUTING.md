# Como contribuir

Gracias por pasar. `nudo` es chico a proposito: si una idea necesita una
dependencia nueva, probablemente no entre.

## Antes de escribir codigo

Abri un issue contando que queres hacer y por que. Asi evitamos que trabajes en
algo que no va a entrar.

## Entorno

- Node 22 o superior.
- Sin dependencias: `npm install` no instala nada, y esta bien.

```console
$ npm test        # suite completa
$ npm run check   # sintaxis + suite
```

## Estilo

- ES modules, sin `require`.
- Nombres y comentarios en espanol; identificadores de codigo en ingles cuando
  el termino tecnico lo pide (`appendEvent`, `fold`).
- Nada de dependencias de runtime. Las de desarrollo tampoco, si se pueden evitar.
- Cada comando vive en `src/commands/`, declara `name`, `summary`, `usage`,
  `options` y `run`, y se registra en `src/commands/index.js`.
- Cada comportamiento nuevo lleva su prueba en `test/` con `node:test`.

## Commits

Mensajes en el formato `tipo(alcance): descripcion`, por ejemplo:

```
feat(stats): mapa de calor por dia
fix(log): tolerar BOM al leer el registro
docs: guia de uso paso a paso
```

## Pull requests

Una idea por PR. Si el cambio toca la interfaz de un comando, actualiza
`docs/comandos.md` en el mismo PR. Si agrega algo visible, agrega una linea al
`CHANGELOG.md` bajo `[Unreleased]`.
