import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { getUserIdFromJWT } from '../middleware/auth'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const r = await pool.query('SELECT * FROM schedules WHERE user_id=$1 ORDER BY start_time DESC', [userId])
  res.json(r.rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { title, start_time, end_time, description } = req.body || {}
  const r = await pool.query(
    `INSERT INTO schedules(user_id, title, start_time, end_time, description) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [userId, title ?? null, start_time ?? null, end_time ?? null, description ?? null],
  )
  res.status(201).json(r.rows[0])
})

router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { title, start_time, end_time, description } = req.body || {}
  const r = await pool.query(
    `UPDATE schedules SET title=COALESCE($1,title), start_time=COALESCE($2,start_time), end_time=COALESCE($3,end_time), description=COALESCE($4,description)
     WHERE id=$5 AND user_id=$6 RETURNING *`,
    [title ?? null, start_time ?? null, end_time ?? null, description ?? null, id, userId],
  )
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.json(r.rows[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const r = await pool.query('DELETE FROM schedules WHERE id=$1 AND user_id=$2', [id, userId])
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.status(204).end()
})

export default router


