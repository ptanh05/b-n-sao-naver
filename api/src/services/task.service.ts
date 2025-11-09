import { pool } from '../db'

export interface TaskData {
  title: string
  description?: string | null
  deadline?: string | null
  status?: string | null
  priority?: number | null
  estimatedMinutes?: number | null
  scheduledAt?: string | null
  category?: string | null
  tags?: string[] | null
}

export class TaskService {
  async getTasksByUserId(userId: number) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  }

  async getTaskById(id: string, userId: number) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id=$1 AND user_id=$2',
      [id, userId]
    )
    return result.rows[0] || null
  }

  async createTask(userId: number, taskData: TaskData) {
    const { title, description, deadline, priority, estimatedMinutes, category, tags } = taskData
    if (!title) throw new Error('title required')

    const result = await pool.query(
      `INSERT INTO tasks(user_id, title, description, deadline, priority, estimated_minutes, category, tags)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        userId,
        title,
        description ?? null,
        deadline ?? null,
        priority ?? 3,
        estimatedMinutes ?? null,
        category ?? null,
        tags ? JSON.stringify(tags) : null,
      ]
    )
    return result.rows[0]
  }

  async updateTask(id: string, userId: number, taskData: Partial<TaskData>) {
    const { title, description, deadline, status, priority, estimatedMinutes, scheduledAt, category, tags } = taskData

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        deadline = COALESCE($3, deadline),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        estimated_minutes = COALESCE($6, estimated_minutes),
        scheduled_at = COALESCE($7, scheduled_at),
        category = COALESCE($8, category),
        tags = COALESCE($9, tags),
        updated_at = now()
       WHERE id=$10 AND user_id=$11
       RETURNING *`,
      [
        title ?? null,
        description ?? null,
        deadline ?? null,
        status ?? null,
        priority ?? null,
        estimatedMinutes ?? null,
        scheduledAt ?? null,
        category ?? null,
        tags ? JSON.stringify(tags) : null,
        id,
        userId,
      ]
    )

    if (result.rowCount === 0) throw new Error('Task not found')
    return result.rows[0]
  }

  async deleteTask(id: string, userId: number) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id=$1 AND user_id=$2',
      [id, userId]
    )

    if (result.rowCount === 0) throw new Error('Task not found')
    return true
  }

  async exportTasks(userId: number) {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1', [userId])
    return result.rows
  }

  async importTasks(userId: number, tasks: any[]) {
    const inserted: any[] = []
    for (const t of tasks) {
      const r = await pool.query(
        `INSERT INTO tasks(user_id, title, description, deadline, status, priority, estimated_minutes, scheduled_at, category, tags, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          userId,
          t.title,
          t.description ?? null,
          t.deadline ?? null,
          t.status ?? 'todo',
          t.priority ?? 3,
          t.estimatedMinutes ?? null,
          t.scheduledAt ?? null,
          t.category ?? null,
          t.tags ? JSON.stringify(t.tags) : null,
          t.createdAt ?? new Date(),
          t.updatedAt ?? new Date(),
        ]
      )
      inserted.push(r.rows[0])
    }
    return inserted
  }
}

