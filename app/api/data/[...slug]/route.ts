import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import '@/api/src/config/loadEnv'
import { pool } from '@/api/src/db'

const jwtSecret = process.env.JWT_SECRET || 'dev_jwt'

function getUserId(): number | null {
  const cookieStore = cookies()
  const token = cookieStore.get('auth')?.value
  if (!token) return null
  try {
    const payload = jwt.verify(token, jwtSecret) as { userId: number }
    return payload.userId
  } catch {
    return null
  }
}

// Resource handlers
const resourceHandlers: Record<string, {
  table: string
  fields: string[]
  specialRoutes?: Record<string, (userId: number, req: NextRequest, params: string[]) => Promise<NextResponse>>
}> = {
  habits: {
    table: 'habits',
    fields: ['name', 'status', 'last_checked'],
  },
  schedules: {
    table: 'schedules',
    fields: ['title', 'start_time', 'end_time', 'description'],
  },
  analytics: {
    table: 'analytics',
    fields: ['type', 'value'],
    specialRoutes: {
      summary: async (userId: number) => {
        try {
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

          const priorityResult = await pool.query(
            `SELECT priority, COUNT(*) as count
            FROM tasks 
            WHERE user_id=$1
            GROUP BY priority
            ORDER BY priority DESC`,
            [userId]
          )

          const streakResult = await pool.query(
            `SELECT COUNT(DISTINCT DATE(updated_at)) as streak
            FROM tasks 
            WHERE user_id=$1 
              AND status = 'done' 
              AND updated_at >= NOW() - INTERVAL '30 days'
              AND updated_at::date >= (SELECT MAX(updated_at::date) - INTERVAL '30 days' FROM tasks WHERE user_id=$1 AND status = 'done')`,
            [userId]
          )

          return NextResponse.json({
            tasks: tasksResult.rows[0],
            completionRate: completionRateResult.rows,
            priorityDistribution: priorityResult.rows,
            productivityStreak: streakResult.rows[0]?.streak || 0,
          })
        } catch (e: any) {
          return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
        }
      },
    },
  },
  pomodoro_sessions: {
    table: 'pomodoro_sessions',
    fields: ['start_time', 'end_time', 'status'],
  },
  sync_logs: {
    table: 'sync_logs',
    fields: ['status', 'details'],
  },
}

// Subtasks special handler
async function handleSubtasks(method: string, userId: number, request: NextRequest, params: string[]) {
  const [action, taskId, id] = params

  if (action === 'task' && taskId) {
    // GET /api/data/subtasks/task/:taskId
    if (method === 'GET') {
      try {
        const taskCheck = await pool.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [taskId, userId])
        if (taskCheck.rowCount === 0) {
          return NextResponse.json({ message: 'Task not found' }, { status: 404 })
        }

        const result = await pool.query('SELECT * FROM subtasks WHERE task_id=$1 ORDER BY "order" ASC', [taskId])
        return NextResponse.json(result.rows)
      } catch (e: any) {
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
      }
    }
  }

  if (!id && method === 'POST') {
    // POST /api/data/subtasks
    const body = await request.json().catch(() => ({}))
    const { taskId, title, order } = body

    if (!taskId || !title) {
      return NextResponse.json({ message: 'taskId and title are required' }, { status: 400 })
    }

    try {
      const taskCheck = await pool.query('SELECT id FROM tasks WHERE id=$1 AND user_id=$2', [taskId, userId])
      if (taskCheck.rowCount === 0) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 })
      }

      let subtaskOrder = order
      if (subtaskOrder === undefined) {
        const maxOrderResult = await pool.query('SELECT MAX("order") as max_order FROM subtasks WHERE task_id=$1', [taskId])
        subtaskOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1
      }

      const result = await pool.query(
        `INSERT INTO subtasks(task_id, title, completed, "order")
         VALUES($1, $2, false, $3) RETURNING *`,
        [taskId, title, subtaskOrder]
      )
      return NextResponse.json(result.rows[0], { status: 201 })
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  if (id) {
    if (method === 'PUT') {
      // PUT /api/data/subtasks/:id
      const body = await request.json().catch(() => ({}))
      const { title, completed, order } = body

      try {
        const subtaskCheck = await pool.query(
          `SELECT s.id FROM subtasks s
           JOIN tasks t ON s.task_id = t.id
           WHERE s.id=$1 AND t.user_id=$2`,
          [id, userId]
        )
        if (subtaskCheck.rowCount === 0) {
          return NextResponse.json({ message: 'Subtask not found' }, { status: 404 })
        }

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

        if (result.rowCount === 0) {
          return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }
        return NextResponse.json(result.rows[0])
      } catch (e: any) {
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
      }
    }

    if (method === 'DELETE') {
      // DELETE /api/data/subtasks/:id
      try {
        const subtaskCheck = await pool.query(
          `SELECT s.id FROM subtasks s
           JOIN tasks t ON s.task_id = t.id
           WHERE s.id=$1 AND t.user_id=$2`,
          [id, userId]
        )
        if (subtaskCheck.rowCount === 0) {
          return NextResponse.json({ message: 'Subtask not found' }, { status: 404 })
        }

        const result = await pool.query('DELETE FROM subtasks WHERE id=$1', [id])
        if (result.rowCount === 0) {
          return NextResponse.json({ message: 'Not found' }, { status: 404 })
        }
        return new NextResponse(null, { status: 204 })
      } catch (e: any) {
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [resource, ...rest] = params.slug || []

  if (resource === 'subtasks') {
    return handleSubtasks('GET', userId, request, rest)
  }

  const handler = resourceHandlers[resource]
  if (!handler) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const [specialRoute, id] = rest

  // Handle special routes (e.g., /analytics/summary)
  if (specialRoute && handler.specialRoutes?.[specialRoute]) {
    return handler.specialRoutes[specialRoute](userId, request, rest)
  }

  if (!id && !specialRoute) {
    // GET /api/data/:resource
    try {
      const orderBy = resource === 'habits' ? 'created_at DESC' : resource === 'schedules' ? 'start_time DESC' : 'created_at DESC'
      const r = await pool.query(`SELECT * FROM ${handler.table} WHERE user_id=$1 ORDER BY ${orderBy}`, [userId])
      return NextResponse.json(r.rows)
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  if (id) {
    // GET /api/data/:resource/:id
    try {
      const r = await pool.query(`SELECT * FROM ${handler.table} WHERE id=$1 AND user_id=$2`, [id, userId])
      if (r.rowCount === 0) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(r.rows[0])
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [resource, ...rest] = params.slug || []
  const body = await request.json().catch(() => ({}))

  if (resource === 'subtasks') {
    return handleSubtasks('POST', userId, request, rest)
  }

  const handler = resourceHandlers[resource]
  if (!handler) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  // POST /api/data/:resource
  try {
    const fieldValues = handler.fields.map((field) => body[field] ?? null)
    const fieldsStr = handler.fields.join(', ')
    const placeholders = handler.fields.map((_, i) => `$${i + 2}`).join(', ')

    const r = await pool.query(
      `INSERT INTO ${handler.table}(user_id, ${fieldsStr}) VALUES($1, ${placeholders}) RETURNING *`,
      [userId, ...fieldValues]
    )
    return NextResponse.json(r.rows[0], { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [resource, ...rest] = params.slug || []

  if (resource === 'subtasks') {
    return handleSubtasks('PUT', userId, request, rest)
  }

  const handler = resourceHandlers[resource]
  if (!handler) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const [id] = rest
  if (!id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))

  // PUT /api/data/:resource/:id
  try {
    const updates = handler.fields
      .map((field, i) => `${field}=COALESCE($${i + 1}, ${field})`)
      .join(', ')

    const fieldValues = handler.fields.map((field) => body[field] ?? null)

    const r = await pool.query(
      `UPDATE ${handler.table} SET ${updates} WHERE id=$${handler.fields.length + 1} AND user_id=$${handler.fields.length + 2} RETURNING *`,
      [...fieldValues, id, userId]
    )

    if (r.rowCount === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(r.rows[0])
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [resource, ...rest] = params.slug || []

  if (resource === 'subtasks') {
    return handleSubtasks('DELETE', userId, request, rest)
  }

  const handler = resourceHandlers[resource]
  if (!handler) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const [id] = rest
  if (!id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  // DELETE /api/data/:resource/:id
  try {
    const r = await pool.query(`DELETE FROM ${handler.table} WHERE id=$1 AND user_id=$2`, [id, userId])
    if (r.rowCount === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}

