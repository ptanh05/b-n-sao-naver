import pool from '../../lib/db';

export const getLogs = async () => {
  const res = await pool.query('SELECT * FROM sync_logs');
  return res.rows;
};

export const getLog = async (id: string) => {
  const res = await pool.query('SELECT * FROM sync_logs WHERE id = $1', [id]);
  return res.rows[0];
};

export const createLog = async (data: { user_id: string; sync_time?: string; status: string; details?: string }) => {
  const res = await pool.query(
    'INSERT INTO sync_logs (user_id, sync_time, status, details) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.user_id, data.sync_time || null, data.status, data.details || null]
  );
  return res.rows[0];
};

export const updateLog = async (id: string, data: { sync_time?: string; status?: string; details?: string }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.sync_time) { fields.push(`sync_time = $${idx++}`); values.push(data.sync_time); }
  if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
  if (data.details) { fields.push(`details = $${idx++}`); values.push(data.details); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE sync_logs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteLog = async (id: string) => {
  await pool.query('DELETE FROM sync_logs WHERE id = $1', [id]);
};
