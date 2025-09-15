import pool from '../../lib/db';

export const getSessions = async () => {
  const res = await pool.query('SELECT * FROM pomodoro_sessions');
  return res.rows;
};

export const getSession = async (id: string) => {
  const res = await pool.query('SELECT * FROM pomodoro_sessions WHERE id = $1', [id]);
  return res.rows[0];
};

export const createSession = async (data: { user_id: string; start_time?: string; end_time?: string; status: string }) => {
  const res = await pool.query(
    'INSERT INTO pomodoro_sessions (user_id, start_time, end_time, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.user_id, data.start_time || null, data.end_time || null, data.status]
  );
  return res.rows[0];
};

export const updateSession = async (id: string, data: { start_time?: string; end_time?: string; status?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.start_time) { fields.push(`start_time = $${idx++}`); values.push(data.start_time); }
  if (data.end_time) { fields.push(`end_time = $${idx++}`); values.push(data.end_time); }
  if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE pomodoro_sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteSession = async (id: string) => {
  await pool.query('DELETE FROM pomodoro_sessions WHERE id = $1', [id]);
};
