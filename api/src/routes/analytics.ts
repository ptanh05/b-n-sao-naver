import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { getUserIdFromJWT } from '../middleware/auth'

const router = Router()

// Get analytics summary
router.get('/summary', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    // Get task statistics
    const tasksResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'done') as completed,
        COUNT(*) FILTER (WHERE status = 'todo') as todo,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE deadline < NOW() AND status != 'done') as overdue
      FROM tasks WHERE user_id=$1`,
      [userId]
    )

    // Get completion rate over time
    const completionRateResult = await pool.query(
      `SELECT 
        DATE(updated_at) as date,
        COUNT(*) FILTER (WHERE status = 'done') as completed,
        COUNT(*) as total
      FROM tasks 
      WHERE user_id=$1 AND updated_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(updated_at)
      ORDER BY date DESC`,
      [userId]
    )

    // Get priority distribution
    const priorityResult = await pool.query(
      `SELECT priority, COUNT(*) as count
      FROM tasks 
      WHERE user_id=$1
      GROUP BY priority
      ORDER BY priority DESC`,
      [userId]
    )

    // Get productivity streak
    const streakResult = await pool.query(
      `SELECT COUNT(DISTINCT DATE(updated_at)) as streak
      FROM tasks 
      WHERE user_id=$1 
        AND status = 'done' 
        AND updated_at >= NOW() - INTERVAL '30 days'
        AND updated_at::date >= (SELECT MAX(updated_at::date) - INTERVAL '30 days' FROM tasks WHERE user_id=$1 AND status = 'done')`,
      [userId]
    )

    res.json({
      tasks: tasksResult.rows[0],
      completionRate: completionRateResult.rows,
      priorityDistribution: priorityResult.rows,
      productivityStreak: streakResult.rows[0]?.streak || 0,
    })
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

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


