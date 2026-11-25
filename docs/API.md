# Referencia de la API de tareas

La API intercambia JSON. En local, la dirección base es `http://localhost:3000`. En producción se usa el dominio de Vercel. Todas las rutas comienzan por `/tasks`.

| Método y ruta | Entrada | Respuesta correcta | Errores habituales |
| --- | --- | --- | --- |
| POST /tasks | Objeto JSON con título | 201, tarea guardada y cabecera Location | 400 si el título está vacío |
| GET /tasks | Sin parámetros | 200, lista ordenada por ID ascendente (puede estar vacía) | 400 si se envían parámetros de consulta |
| GET /tasks/:id | ID entero positivo | 200, tarea solicitada | 400 si el ID es inválido, 404 si no existe |
| PUT /tasks/:id | ID y objeto JSON con título | 200, tarea reemplazada con el mismo ID | 400 si los datos son inválidos, 404 si no existe |
| DELETE /tasks/:id | ID entero positivo | 204, sin cuerpo | 400 si el ID es inválido, 404 si no existe |

## Campos de la tarea

| Campo | Regla |
| --- | --- |
| id | Entero positivo asignado por la base de datos. Solo aparece en la respuesta. |
| titulo | Texto obligatorio de 1 a 120 caracteres tras recortar los espacios exteriores. |
| descripcion | Texto opcional de hasta 1000 caracteres. Valor inicial vacío. |
| fechaLimite | Fecha real en formato AAAA-MM-DD o null. Valor inicial null. |
| estado | Uno de dos valores: pendiente o completado. Valor inicial pendiente. |

POST y PUT requieren un objeto y la cabecera `Content-Type: application/json`. Se rechazan los campos desconocidos. PUT representa la tarea completa: si se omiten campos opcionales, recuperan sus valores iniciales. No se admiten parámetros de consulta. El cuerpo JSON tiene un límite de 16 KiB.

## Ejemplo de creación

Petición a `POST /tasks`:

```json
{"titulo":"Preparar la exposición","descripcion":"Revisar el diagrama","fechaLimite":"2026-12-10","estado":"pendiente"}
```

Respuesta de ejemplo, con estado 201 y cabecera `Location: /tasks/1`:

```json
{"id":1,"titulo":"Preparar la exposición","descripcion":"Revisar el diagrama","fechaLimite":"2026-12-10","estado":"pendiente"}
```

## Ejemplo de actualización y borrado

Envía a `PUT /tasks/1` este cuerpo para marcar la tarea como completada conservando los demás campos:

```json
{"titulo":"Preparar la exposición","descripcion":"Revisar el diagrama","fechaLimite":"2026-12-10","estado":"completado"}
```

La respuesta 200 devuelve el objeto actualizado con el mismo ID. `GET /tasks/1` permite comprobar el cambio. `DELETE /tasks/1` devuelve 204 sin cuerpo. A partir de ese momento, `GET /tasks/1` devuelve 404:

```json
{"error":"La tarea no existe."}
```

## Otras respuestas

Los errores devuelven un objeto con la propiedad `error`. Un JSON mal formado recibe 400, un cuerpo demasiado grande 413 y un tipo de contenido distinto de JSON en POST o PUT recibe 415. Un fallo interno de almacenamiento devuelve un error 500 genérico.
