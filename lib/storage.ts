import type { Task } from "./types"
import { authManager } from "./auth"

const getUserStorageKey = (key: string): string => {
  const user = authManager.getCurrentUser()
  if (!user) return key // Fallback for unauthenticated users
  return `user_${user.id}_${key}`
}

const TASKS_KEY = "time-management-tasks"
const HABITS_KEY = "time-management-habits"
const SETTINGS_KEY = "time-management-settings"

export const storage = {
  // Tích hợp backend API cho các thao tác lưu trữ
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch('/api/entities/tasks')
    if (!res.ok) return []
    return await res.json()
  },

  saveTasks: async (tasks: Task[]): Promise<void> => {
    await fetch('/api/entities/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    })
  },

  getHabits: async (): Promise<any[]> => {
    const res = await fetch('/api/entities/habits')
    if (!res.ok) return []
    return await res.json()
  },

  saveHabits: async (habits: any[]): Promise<void> => {
    await fetch('/api/entities/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habits),
    })
  },

  getSettings: async (): Promise<any> => {
    const res = await fetch('/api/entities/settings')
    if (!res.ok) return {}
    return await res.json()
  },

  saveSettings: async (settings: any): Promise<void> => {
    await fetch('/api/entities/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
  },

  exportTasks: async (): Promise<string> => {
    const tasks = await storage.getTasks()
    return JSON.stringify(tasks, null, 2)
  },

  importTasks: async (jsonData: string): Promise<Task[]> => {
    const tasks = JSON.parse(jsonData)
    await storage.saveTasks(tasks)
    return tasks
  },

  clearUserData: async (): Promise<void> => {
    await fetch('/api/entities/clear', { method: 'POST' })
  },
}
