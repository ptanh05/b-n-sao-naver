import { Router, Request, Response } from 'express'
import { pool } from '../db'
import { getUserIdFromJWT } from '../middleware/auth'

const router = Router()

// Get all subtasks for a task
router.get('/task/:taskId', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { taskId } = req.params
  
  try {
    // Verify task belongs to user
    const taskCheck = await pool.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [taskId, userId])
    if (taskCheck.rowCount === 0) return res.status(404).json({ message: 'Task not found' })
    
    const result = await pool.query(
      'SELECT * FROM subtasks WHERE task_id=$1 ORDER BY "order" ASC',
      [taskId]
    )
    res.json(result.rows)
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

// Create subtask
router.post('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { taskId, title, order } = req.body || {}
  
  if (!taskId || !title) {
    return res.status(400).json({ message: 'taskId and title are required' })
  }
  
  try {
    // Verify task belongs to user
    const taskCheck = await pool.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [taskId, userId])
    if (taskCheck.rowCount === 0) return res.status(404).json({ message: 'Task not found' })
    
    // Get max order if not provided
    let subtaskOrder = order
    if (subtaskOrder === undefined) {
      const maxOrderResult = await pool.query(
        'SELECT MAX("order") as max_order FROM subtasks WHERE task_id=$1',
        [taskId]
      )
      subtaskOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1
    }
    
    const result = await pool.query(
      `INSERT INTO subtasks(task_id, title, completed, "order")
       VALUES($1, $2, false, $3) RETURNING *`,
      [taskId, title, subtaskOrder]
    )
    res.status(201).json(result.rows[0])
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

// Update subtask
router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { title, completed, order } = req.body || {}
  
  try {
    // Verify subtask belongs to user's task
    const subtaskCheck = await pool.query(
      `SELECT s.id FROM subtasks s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id=$1 AND t.user_id=$2`,
      [id, userId]
    )
    if (subtaskCheck.rowCount === 0) return res.status(404).json({ message: 'Subtask not found' })
    
    const result = await pool.query(
      `UPDATE subtasks SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed),
        "order" = COALESCE($3, "order"),
        updated_at = now()
       WHERE id=$4
       RETURNING *`,
      [title ?? null, completed ?? null, order ?? null, id]
    )
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' })
    res.json(result.rows[0])
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

// Delete subtask
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromJWT(req)
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  
  try {
    // Verify subtask belongs to user's task
    const subtaskCheck = await pool.query(
      `SELECT s.id FROM subtasks s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id=$1 AND t.user_id=$2`,
      [id, userId]
    )
    if (subtaskCheck.rowCount === 0) return res.status(404).json({ message: 'Subtask not found' })
    
    const result = await pool.query('DELETE FROM subtasks WHERE id=$1', [id])
    if (result.rowCount === 0) return res.status(404).json({ message: 'Not found' })
    res.status(204).end()
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Server error' })
  }
})

export default router

