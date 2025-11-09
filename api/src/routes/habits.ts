import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { getUserIdFromJWT } from '../middleware/auth'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const r = await pool.query('SELECT * FROM habits WHERE user_id=$1 ORDER BY created_at DESC', [userId])
  res.json(r.rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { name, status, last_checked } = req.body || {}
  if (!name) return res.status(400).json({ message: 'name required' })
  const r = await pool.query(
    `INSERT INTO habits(user_id, name, status, last_checked) VALUES($1,$2,$3,$4) RETURNING *`,
    [userId, name, status ?? null, last_checked ?? null],
  )
  res.status(201).json(r.rows[0])
})

router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { name, status, last_checked } = req.body || {}
  const r = await pool.query(
    `UPDATE habits SET name=COALESCE($1,name), status=COALESCE($2,status), last_checked=COALESCE($3,last_checked)
     WHERE id=$4 AND user_id=$5 RETURNING *`,
    [name ?? null, status ?? null, last_checked ?? null, id, userId],
  )
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.json(r.rows[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const r = await pool.query('DELETE FROM habits WHERE id=$1 AND user_id=$2', [id, userId])
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.status(204).end()
})

export default router


