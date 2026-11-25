const { taskService } = require('../src/tasks');

const original = { id: 7, titulo: 'Leer el enunciado', descripcion: '', fechaLimite: null, estado: 'pendiente' };
let repository;
let tasks;

beforeEach(() => {
  repository = { create: jest.fn(), update: jest.fn(), remove: jest.fn(), get: jest.fn() };
  tasks = taskService(repository);
});

test('crea una tarea con título normalizado y valores iniciales', async () => {
  repository.create.mockResolvedValue(original);
  const saved = await tasks.create({ titulo: '  Leer el enunciado  ' });
  expect(repository.create).toHaveBeenCalledWith({
    titulo: 'Leer el enunciado', descripcion: '', fechaLimite: null, estado: 'pendiente'
  });
  expect(saved).toEqual(original);
});

test('actualiza una tarea por su ID y devuelve el nuevo estado', async () => {
  const body = { titulo: 'Entrega revisada', descripcion: 'Lista', fechaLimite: '2026-12-10', estado: 'completado' };
  repository.update.mockResolvedValue({ id: 7, ...body });
  const saved = await tasks.update('7', body);
  expect(repository.update).toHaveBeenCalledWith(7, body);
  expect(saved).toEqual({ id: 7, ...body });
});

test('elimina la tarea por su ID y permite responder sin cuerpo', async () => {
  repository.remove.mockResolvedValue(true);
  await expect(tasks.remove('7')).resolves.toBeUndefined();
  expect(repository.remove).toHaveBeenCalledWith(7);
});

test('rechaza una fecha imposible antes de insertar', () => {
  expect(() => tasks.create({ titulo: 'Comprobar', fechaLimite: '2026-02-30' })).toThrow('calendario');
  expect(repository.create).not.toHaveBeenCalled();
});

test('una segunda eliminación de una tarea ausente devuelve error 404', async () => {
  repository.remove.mockResolvedValue(false);
  await expect(tasks.remove('7')).rejects.toMatchObject({ status: 404 });
});

test('un ID inválido no llega al almacenamiento', async () => {
  await expect(tasks.get('0')).rejects.toMatchObject({ status: 400 });
  expect(repository.get).not.toHaveBeenCalled();
});
