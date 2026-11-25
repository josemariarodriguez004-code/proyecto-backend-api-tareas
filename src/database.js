const { createClient } = require('@libsql/client');

const createTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fechaLimite TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completado'))
  )`;

let pendingConnection;

function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if ((url || process.env.VERCEL) && (!url || !authToken || !/^(libsql|https):\/\//.test(url))) {
    throw new Error('La base de datos remota necesita una URL y un token de Turso.');
  }
  return createClient(url ? { url, authToken } : { url: 'file:tareas.db' });
}

async function initialize() {
  const db = connect();
  try {
    await db.execute(createTable);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

async function execute(sql, args = []) {
  if (!pendingConnection) {
    pendingConnection = initialize().catch(error => {
      pendingConnection = undefined;
      throw error;
    });
  }
  const db = await pendingConnection;
  return db.execute({ sql, args });
}

const fields = 'id, titulo, descripcion, fechaLimite, estado';
const values = task => [task.titulo, task.descripcion, task.fechaLimite, task.estado];

module.exports = {
  async list() {
    return (await execute(`SELECT ${fields} FROM tasks ORDER BY id`)).rows;
  },
  async get(id) {
    return (await execute(`SELECT ${fields} FROM tasks WHERE id = ?`, [id])).rows[0];
  },
  async create(task) {
    const sql = `INSERT INTO tasks (titulo, descripcion, fechaLimite, estado)
                 VALUES (?, ?, ?, ?) RETURNING ${fields}`;
    return (await execute(sql, values(task))).rows[0];
  },
  async update(id, task) {
    const sql = `UPDATE tasks SET titulo = ?, descripcion = ?, fechaLimite = ?, estado = ?
                 WHERE id = ? RETURNING ${fields}`;
    return (await execute(sql, [...values(task), id])).rows[0];
  },
  async remove(id) {
    return (await execute('DELETE FROM tasks WHERE id = ?', [id])).rowsAffected > 0;
  }
};
