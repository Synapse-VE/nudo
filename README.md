# nudo

Tu memoria externa en la terminal: anota, etiqueta y encuentra.

`nudo` es un registro personal que vive en un archivo de texto plano. Cada nota
es una linea JSON, asi que puedes leerla con `cat`, respaldarla con `git` o
procesarla con `jq`. Sin base de datos, sin servidor, sin dependencias.

```console
$ nudo add "probar el parser de duraciones" -t nudo -t ideas
$ nudo ls -t ideas
```

## Estado

En construccion. La CLI todavia solo sabe responder `help` y `version`.

## Licencia

MIT
