import pool from '../../lib/db';

export const getHabits = async () => {
  const res = await pool.query('SELECT * FROM habits');
  return res.rows;
};

export const getHabit = async (id: string) => {
  const res = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);
  return res.rows[0];
};

export const createHabit = async (data: { user_id: string; name: string; status: string; last_checked?: string }) => {
  const res = await pool.query(
    'INSERT INTO habits (user_id, name, status, last_checked) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.user_id, data.name, data.status, data.last_checked || null]
  );
  return res.rows[0];
};

export const updateHabit = async (id: string, data: { name?: string; status?: string; last_checked?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
  if (data.last_checked) { fields.push(`last_checked = $${idx++}`); values.push(data.last_checked); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE habits SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteHabit = async (id: string) => {
  await pool.query('DELETE FROM habits WHERE id = $1', [id]);
};
