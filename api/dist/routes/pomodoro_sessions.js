"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
function getUserIdFromJWT(req) {
    const token = req.cookies?.auth;
    if (!token)
        return null;
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev_jwt');
        return payload.userId;
    }
    catch {
        return null;
    }
}
router.get('/', async (req, res) => {
    const userId = getUserIdFromJWT(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const r = await db_1.pool.query('SELECT * FROM pomodoro_sessions WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
    res.json(r.rows);
});
router.post('/', async (req, res) => {
    const userId = getUserIdFromJWT(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { start_time, end_time, status } = req.body || {};
    const r = await db_1.pool.query('INSERT INTO pomodoro_sessions(user_id, start_time, end_time, status) VALUES($1,$2,$3,$4) RETURNING *', [userId, start_time ?? null, end_time ?? null, status ?? null]);
    res.status(201).json(r.rows[0]);
});
router.put('/:id', async (req, res) => {
    const userId = getUserIdFromJWT(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { start_time, end_time, status } = req.body || {};
    const r = await db_1.pool.query('UPDATE pomodoro_sessions SET start_time=COALESCE($1,start_time), end_time=COALESCE($2,end_time), status=COALESCE($3,status) WHERE id=$4 AND user_id=$5 RETURNING *', [start_time ?? null, end_time ?? null, status ?? null, id, userId]);
    if (r.rowCount === 0)
        return res.status(404).json({ message: 'Not found' });
    res.json(r.rows[0]);
});
router.delete('/:id', async (req, res) => {
    const userId = getUserIdFromJWT(req);
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const r = await db_1.pool.query('DELETE FROM pomodoro_sessions WHERE id=$1 AND user_id=$2', [id, userId]);
    if (r.rowCount === 0)
        return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
});
exports.default = router;
