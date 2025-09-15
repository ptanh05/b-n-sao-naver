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
  getTasks: (): Task[] => {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(getUserStorageKey(TASKS_KEY))
      if (!data) return []
      const tasks = JSON.parse(data)
      return tasks.map((task: any) => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        scheduledAt: task.scheduledAt ? new Date(task.scheduledAt) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }))
    } catch (error) {
      console.error("Error loading tasks:", error)
      return []
    }
  },

  saveTasks: (tasks: Task[]): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(getUserStorageKey(TASKS_KEY), JSON.stringify(tasks))
    } catch (error) {
      console.error("Error saving tasks:", error)
    }
  },

  getHabits: (): any[] => {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(getUserStorageKey(HABITS_KEY))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error loading habits:", error)
      return []
    }
  },

  saveHabits: (habits: any[]): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(getUserStorageKey(HABITS_KEY), JSON.stringify(habits))
    } catch (error) {
      console.error("Error saving habits:", error)
    }
  },

  getSettings: (): any => {
    if (typeof window === "undefined") return {}
    try {
      const data = localStorage.getItem(getUserStorageKey(SETTINGS_KEY))
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error loading settings:", error)
      return {}
    }
  },

  saveSettings: (settings: any): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(getUserStorageKey(SETTINGS_KEY), JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  },

  exportTasks: (): string => {
    const tasks = storage.getTasks()
    return JSON.stringify(tasks, null, 2)
  },

  importTasks: (jsonData: string): Task[] => {
    try {
      const tasks = JSON.parse(jsonData)
      storage.saveTasks(tasks)
      return tasks
    } catch (error) {
      console.error("Error importing tasks:", error)
      throw new Error("Invalid JSON format")
    }
  },

  clearUserData: (): void => {
    const user = authManager.getCurrentUser()
    if (!user) return

    localStorage.removeItem(getUserStorageKey(TASKS_KEY))
    localStorage.removeItem(getUserStorageKey(HABITS_KEY))
    localStorage.removeItem(getUserStorageKey(SETTINGS_KEY))
  },
}
