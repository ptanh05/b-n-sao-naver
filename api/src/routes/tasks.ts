import { Router, Request, Response, NextFunction } from 'express'
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

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  ;(req as any).userId = userId
  next()
}

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [userId])
    res.json(result.rows)
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const { title, description, deadline, priority, estimatedMinutes } = req.body || {}
    if (!title) return res.status(400).json({ message: 'title required' })
    const result = await pool.query(
      `INSERT INTO tasks(user_id, title, description, deadline, priority, estimated_minutes)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, title, description ?? null, deadline ?? null, priority ?? 3, estimatedMinutes ?? null],
    )
    res.status(201).json(result.rows[0])
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const { id } = req.params
    const { title, description, deadline, status, priority, estimatedMinutes, scheduledAt } = req.body || {}
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        deadline = COALESCE($3, deadline),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        estimated_minutes = COALESCE($6, estimated_minutes),
        scheduled_at = COALESCE($7, scheduled_at),
        updated_at = now()
       WHERE id=$8 AND user_id=$9
       RETURNING *`,
      [title ?? null, description ?? null, deadline ?? null, status ?? null, priority ?? null, estimatedMinutes ?? null, scheduledAt ?? null, id, userId],
    )
    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' })
    res.json(result.rows[0])
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const { id } = req.params
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [id, userId])
    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' })
    res.status(204).end()
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

router.get('/export', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1', [userId])
    res.json({ data: JSON.stringify(result.rows) })
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

router.post('/import', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number
    const { data } = req.body || {}
    if (typeof data !== 'string') return res.status(400).json({ message: 'Invalid data' })
    const tasks = JSON.parse(data)
    // Optional: clear existing tasks or merge; here we append
    const inserted: any[] = []
    for (const t of tasks) {
      const r = await pool.query(
        `INSERT INTO tasks(user_id, title, description, deadline, status, priority, estimated_minutes, scheduled_at, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          userId,
          t.title,
          t.description ?? null,
          t.deadline ?? null,
          t.status ?? 'todo',
          t.priority ?? 3,
          t.estimatedMinutes ?? null,
          t.scheduledAt ?? null,
          t.createdAt ?? new Date().toISOString(),
          t.updatedAt ?? new Date().toISOString(),
        ],
      )
      inserted.push(r.rows[0])
    }
    res.json(inserted)
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

export default router


