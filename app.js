const express = require('express');
const repository = require('./src/database');
const { HttpError, taskService } = require('./src/tasks');

const app = express();
const tasks = taskService(repository);
app.disable('x-powered-by');
app.disable('etag');
app.use('/tasks', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (Object.keys(req.query).length > 0) {
    throw new HttpError(400, 'Esta ruta no admite parámetros de consulta.');
  }
  if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
    throw new HttpError(415, 'Utiliza Content-Type: application/json.');
  }
  next();
});
app.use(express.json({ limit: '16kb' }));

app.post('/tasks', async (req, res) => {
  const saved = await tasks.create(req.body);
  res.location('/tasks/' + saved.id).status(201).json(saved);
});

app.get('/tasks', async (req, res) => {
  res.json(await tasks.list());
});

app.get('/tasks/:id', async (req, res) => {
  res.json(await tasks.get(req.params.id));
});

app.put('/tasks/:id', async (req, res) => {
  res.json(await tasks.update(req.params.id, req.body));
});

app.delete('/tasks/:id', async (req, res) => {
  await tasks.remove(req.params.id);
  res.status(204).end();
});

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'El cuerpo supera 16 KiB.' });
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: 'La petición no es válida.' });
  }
  console.error('Error interno de la API:', error.code || error.name);
  res.status(500).json({ error: 'No se pudo completar la operación.' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('API de tareas en http://localhost:' + port + '/tasks'));
}

module.exports = app;
