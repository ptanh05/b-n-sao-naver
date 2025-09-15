import pool from '../../lib/db';

export const getTasks = async () => {
  const res = await pool.query('SELECT * FROM tasks');
  return res.rows;
};

export const getTask = async (id: string) => {
  const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return res.rows[0];
};

export const createTask = async (data: { user_id: string; title: string; description?: string; status: string; priority: number; deadline?: string }) => {
  const res = await pool.query(
    'INSERT INTO tasks (user_id, title, description, status, priority, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [data.user_id, data.title, data.description || null, data.status, data.priority, data.deadline || null]
  );
  return res.rows[0];
};

export const updateTask = async (id: string, data: { title?: string; description?: string; status?: string; priority?: number; deadline?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.title) { fields.push(`title = $${idx++}`); values.push(data.title); }
  if (data.description) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
  if (data.priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(data.priority); }
  if (data.deadline) { fields.push(`deadline = $${idx++}`); values.push(data.deadline); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteTask = async (id: string) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
};
