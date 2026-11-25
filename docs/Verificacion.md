# Verificación local del proyecto

Se ejecutaron Jest y la colección de Postman con Newman contra el servidor Express y una base SQLite local. Para comprobar el despliegue, la misma colección admite la URL pública en la variable baseUrl.

## Jest

| Prueba unitaria | Resultado |
| --- | --- |
| Crea una tarea con título normalizado y valores iniciales | Correcto |
| Actualiza una tarea por su ID y devuelve el nuevo estado | Correcto |
| Elimina la tarea por su ID y permite responder sin cuerpo | Correcto |
| Rechaza una fecha imposible antes de insertar | Correcto |
| Una segunda eliminación de una tarea ausente devuelve error 404 | Correcto |
| Un ID inválido no llega al almacenamiento | Correcto |

## Colección de Postman

Se completaron 16 peticiones y 32 comprobaciones, sin fallos.

| Petición | HTTP observado | Comprobaciones superadas |
| --- | ---: | ---: |
| 01 · Crear una tarea | 201 | 2 |
| 02 · Listar y localizar la tarea creada | 200 | 2 |
| 03 · Consultar por ID | 200 | 2 |
| 04 · Rechazar un título vacío | 400 | 2 |
| 05 · Rechazar un parámetro de listado no admitido | 400 | 2 |
| 06 · Rechazar un ID de texto | 400 | 2 |
| 07 · Rechazar una fecha imposible | 400 | 2 |
| 08 · Actualizar la tarea | 200 | 2 |
| 09 · Rechazar un estado desconocido | 400 | 2 |
| 10 · Comprobar que la actualización válida persiste | 200 | 2 |
| 11 · Rechazar un tipo de contenido incorrecto | 415 | 2 |
| 12 · Eliminar la tarea | 204 | 2 |
| 13 · Consultar la tarea eliminada | 404 | 2 |
| 14 · Actualizar la tarea eliminada | 404 | 2 |
| 15 · Repetir el borrado | 404 | 2 |
| 16 · Comprobar el listado final | 200 | 2 |

## Persistencia

Se creó una tarea, se detuvo el proceso de Node y se inició otro desde el mismo directorio. La consulta por ID recuperó el título original desde el archivo SQLite. Después se eliminó la tarea de prueba.
