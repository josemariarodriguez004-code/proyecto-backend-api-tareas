class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function parseId(value) {
  const id = Number(value);
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) {
    throw new HttpError(400, 'El ID debe ser un entero positivo.');
  }
  return id;
}

function readTask(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Se esperaba un objeto JSON.');
  }
  const allowed = ['titulo', 'descripcion', 'fechaLimite', 'estado'];
  if (Object.keys(body).some(key => !allowed.includes(key))) {
    throw new HttpError(400, 'La tarea contiene un campo desconocido.');
  }
  const { titulo, descripcion = '', fechaLimite = null, estado = 'pendiente' } = body;
  if (typeof titulo !== 'string' || !titulo.trim() || [...titulo.trim()].length > 120) {
    throw new HttpError(400, 'El título debe tener entre 1 y 120 caracteres.');
  }
  if (typeof descripcion !== 'string' || [...descripcion].length > 1000) {
    throw new HttpError(400, 'La descripción debe ser un texto de hasta 1000 caracteres.');
  }
  if (fechaLimite !== null) {
    if (typeof fechaLimite !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fechaLimite)) {
      throw new HttpError(400, 'La fecha límite debe tener formato AAAA-MM-DD.');
    }
    const date = new Date(fechaLimite + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== fechaLimite) {
      throw new HttpError(400, 'La fecha límite debe existir en el calendario.');
    }
  }
  if (!['pendiente', 'completado'].includes(estado)) {
    throw new HttpError(400, 'El estado debe ser pendiente o completado.');
  }
  return { titulo: titulo.trim(), descripcion, fechaLimite, estado };
}

function requireExisting(value) {
  if (!value) throw new HttpError(404, 'La tarea no existe.');
  return value;
}

function taskService(repository) {
  return {
    list: () => repository.list(),
    get: async id => requireExisting(await repository.get(parseId(id))),
    create: body => repository.create(readTask(body)),
    update: async (id, body) =>
      requireExisting(await repository.update(parseId(id), readTask(body))),
    remove: async id => {
      requireExisting(await repository.remove(parseId(id)));
    }
  };
}

module.exports = { HttpError, taskService };
