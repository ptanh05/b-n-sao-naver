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
  const r = await pool.query('SELECT * FROM analytics WHERE user_id=$1 ORDER BY created_at DESC', [userId])
  res.json(r.rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { type, value } = req.body || {}
  const r = await pool.query(
    'INSERT INTO analytics(user_id, type, value) VALUES($1,$2,$3) RETURNING *',
    [userId, type ?? null, value ?? null],
  )
  res.status(201).json(r.rows[0])
})

router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { type, value } = req.body || {}
  const r = await pool.query(
    'UPDATE analytics SET type=COALESCE($1,type), value=COALESCE($2,value) WHERE id=$3 AND user_id=$4 RETURNING *',
    [type ?? null, value ?? null, id, userId],
  )
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.json(r.rows[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const r = await pool.query('DELETE FROM analytics WHERE id=$1 AND user_id=$2', [id, userId])
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' })
  res.status(204).end()
})

export default router


