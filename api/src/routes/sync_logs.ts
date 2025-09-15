import { Router, Request, Response } from 'express'
import { pool } from '../db'
import jwt from 'jsonwebtoken'

const router = Router()

function getUserIdFromJWT(req: Request): number | null {
  const token = (req as any).cookies?.auth as string | undefined
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt') as { userId: number }
    return payload.userId
  } catch {
    return null
  }
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const r = await pool.query('SELECT * FROM sync_logs WHERE user_id=$1 ORDER BY sync_time DESC', [userId])
  res.json(r.rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { status, details } = req.body || {}
  const r = await pool.query(
    'INSERT INTO sync_logs(user_id, status, details) VALUES($1,$2,$3) RETURNING *',
    [userId, status ?? null, details ?? null],
  )
  res.status(201).json(r.rows[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const r = await pool.query('DELETE FROM sync_logs WHERE id=$1 AND user_id=$2', [id, userId])
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.status(204).end()
})

export default router


