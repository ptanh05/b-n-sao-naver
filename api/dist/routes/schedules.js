"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
async function getUserIdFromSession(req) {
    const token = req.cookies?.session;
    if (!token)
        return null;
    const result = await db_1.pool.query('SELECT id FROM users WHERE session_token=$1', [token]);
    if (result.rowCount === 0)
        return null;
    return result.rows[0].id;
}
router.get('/', async (req, res) => {
    const userId = await getUserIdFromSession(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const r = await db_1.pool.query('SELECT * FROM schedules WHERE user_id=$1 ORDER BY start_time DESC', [userId]);
    res.json(r.rows);
});
router.post('/', async (req, res) => {
    const userId = await getUserIdFromSession(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { title, start_time, end_time, description } = req.body || {};
    const r = await db_1.pool.query(`INSERT INTO schedules(user_id, title, start_time, end_time, description) VALUES($1,$2,$3,$4,$5) RETURNING *`, [userId, title ?? null, start_time ?? null, end_time ?? null, description ?? null]);
    res.status(201).json(r.rows[0]);
});
router.put('/:id', async (req, res) => {
    const userId = await getUserIdFromSession(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { title, start_time, end_time, description } = req.body || {};
    const r = await db_1.pool.query(`UPDATE schedules SET title=COALESCE($1,title), start_time=COALESCE($2,start_time), end_time=COALESCE($3,end_time), description=COALESCE($4,description)
     WHERE id=$5 AND user_id=$6 RETURNING *`, [title ?? null, start_time ?? null, end_time ?? null, description ?? null, id, userId]);
    if (r.rowCount === 0)
        return res.status(404).json({ message: 'Not found' });
    res.json(r.rows[0]);
});
router.delete('/:id', async (req, res) => {
    const userId = await getUserIdFromSession(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const r = await db_1.pool.query('DELETE FROM schedules WHERE id=$1 AND user_id=$2', [id, userId]);
    if (r.rowCount === 0)
        return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
});
exports.default = router;
