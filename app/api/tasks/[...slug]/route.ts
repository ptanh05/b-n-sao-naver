import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import '@/api/src/config/loadEnv'
import { TaskService } from '@/api/src/services/task.service'

const taskService = new TaskService()
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

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [endpoint, id] = params.slug || []

  if (!endpoint) {
    // GET /api/tasks
    try {
      const tasks = await taskService.getTasksByUserId(userId)
      return NextResponse.json(tasks)
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  if (endpoint === 'export') {
    // GET /api/tasks/export
    try {
      const tasks = await taskService.exportTasks(userId)
      return NextResponse.json({ data: JSON.stringify(tasks) })
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  if (id || endpoint) {
    // GET /api/tasks/:id
    const taskId = id || endpoint
    try {
      const task = await taskService.getTaskById(taskId, userId)
      if (!task) {
        return NextResponse.json({ message: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(task)
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

  const [endpoint] = params.slug || []
  const body = await request.json().catch(() => ({}))

  if (!endpoint) {
    // POST /api/tasks
    try {
      const task = await taskService.createTask(userId, body)
      return NextResponse.json(task, { status: 201 })
    } catch (e: any) {
      if (e.message === 'title required') {
        return NextResponse.json({ message: e.message }, { status: 400 })
      }
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  if (endpoint === 'import') {
    // POST /api/tasks/import
    try {
      const { data } = body
      if (typeof data !== 'string') {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 })
      }
      const tasks = JSON.parse(data)
      const inserted = await taskService.importTasks(userId, tasks)
      return NextResponse.json({ success: true, inserted: inserted.length })
    } catch (e: any) {
      return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [id] = params.slug || []
  if (!id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))

  try {
    const task = await taskService.updateTask(id, userId, body)
    return NextResponse.json(task)
  } catch (e: any) {
    if (e.message === 'Task not found') {
      return NextResponse.json({ message: e.message }, { status: 404 })
    }
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const userId = getUserId()
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const [id] = params.slug || []
  if (!id) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  try {
    await taskService.deleteTask(id, userId)
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    if (e.message === 'Task not found') {
      return NextResponse.json({ message: e.message }, { status: 404 })
    }
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}

