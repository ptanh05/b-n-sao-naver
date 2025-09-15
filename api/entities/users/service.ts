import pool from '../../lib/db';

export const getUsers = async () => {
  const res = await pool.query('SELECT id, name, email FROM users');
  return res.rows;
};

export const getUser = async (id: string) => {
  const res = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
  return res.rows[0];
};

export const createUser = async (data: { name: string; email: string; password: string }) => {
  const res = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [data.name, data.email, data.password]
  );
  return res.rows[0];
};

export const updateUser = async (id: string, data: { name?: string; email?: string; password?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email); }
  if (data.password) { fields.push(`password = $${idx++}`); values.push(data.password); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email`,
    values
  );
  return res.rows[0];
};

export const deleteUser = async (id: string) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
