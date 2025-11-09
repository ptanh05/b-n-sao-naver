import { Request, Response } from 'express'
import { TaskService } from '../services/task.service'

const taskService = new TaskService()

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const tasks = await taskService.getTasksByUserId(userId)
      res.json(tasks)
    } catch (e: any) {
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const { id } = req.params
      const task = await taskService.getTaskById(id, userId)
      if (!task) return res.status(404).json({ message: 'Not found' })
      res.json(task)
    } catch (e: any) {
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const task = await taskService.createTask(userId, req.body)
      res.status(201).json(task)
    } catch (e: any) {
      if (e.message === 'title required') {
        return res.status(400).json({ message: e.message })
      }
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const { id } = req.params
      const task = await taskService.updateTask(id, userId, req.body)
      res.json(task)
    } catch (e: any) {
      if (e.message === 'Task not found') {
        return res.status(404).json({ message: e.message })
      }
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const { id } = req.params
      await taskService.deleteTask(id, userId)
      res.status(204).end()
    } catch (e: any) {
      if (e.message === 'Task not found') {
        return res.status(404).json({ message: e.message })
      }
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async exportTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const tasks = await taskService.exportTasks(userId)
      res.json({ data: JSON.stringify(tasks) })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }

  async importTasks(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as number
      const { data } = req.body || {}
      if (typeof data !== 'string') return res.status(400).json({ message: 'Invalid data' })
      const tasks = JSON.parse(data)
      const inserted = await taskService.importTasks(userId, tasks)
      res.json({ success: true, inserted: inserted.length })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || 'Server error' })
    }
  }
}

