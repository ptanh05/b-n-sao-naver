import pool from '../../lib/db';

export const getSchedules = async () => {
  const res = await pool.query('SELECT * FROM schedules');
  return res.rows;
};

export const getSchedule = async (id: string) => {
  const res = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
  return res.rows[0];
};

export const createSchedule = async (data: { user_id: string; title: string; start_time?: string; end_time?: string; description?: string }) => {
  const res = await pool.query(
    'INSERT INTO schedules (user_id, title, start_time, end_time, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.user_id, data.title, data.start_time || null, data.end_time || null, data.description || null]
  );
  return res.rows[0];
};

export const updateSchedule = async (id: string, data: { title?: string; start_time?: string; end_time?: string; description?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.title) { fields.push(`title = $${idx++}`); values.push(data.title); }
  if (data.start_time) { fields.push(`start_time = $${idx++}`); values.push(data.start_time); }
  if (data.end_time) { fields.push(`end_time = $${idx++}`); values.push(data.end_time); }
  if (data.description) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE schedules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteSchedule = async (id: string) => {
  await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
};
