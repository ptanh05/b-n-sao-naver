import pool from '../../lib/db';

export const getAnalytics = async () => {
  const res = await pool.query('SELECT * FROM analytics');
  return res.rows;
};

export const getAnalytic = async (id: string) => {
  const res = await pool.query('SELECT * FROM analytics WHERE id = $1', [id]);
  return res.rows[0];
};

export const createAnalytic = async (data: { user_id: string; type: string; value: number }) => {
  const res = await pool.query(
    'INSERT INTO analytics (user_id, type, value) VALUES ($1, $2, $3) RETURNING *',
    [data.user_id, data.type, data.value]
  );
  return res.rows[0];
};

export const updateAnalytic = async (id: string, data: { type?: string; value?: number }) => {
  const fields = [];
  const values = [];
  let idx = 1;
  if (data.type) { fields.push(`type = $${idx++}`); values.push(data.type); }
  if (data.value !== undefined) { fields.push(`value = $${idx++}`); values.push(data.value); }
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query(
    `UPDATE analytics SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0];
};

export const deleteAnalytic = async (id: string) => {
  await pool.query('DELETE FROM analytics WHERE id = $1', [id]);
};
