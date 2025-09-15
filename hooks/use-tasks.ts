"use client"

import { useState, useEffect } from "react"
import type { Task, TaskFormData } from "@/lib/types"
import { useAuth } from "./use-auth"
import { api, endpoints } from "@/lib/api"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true)
      if (isAuthenticated) {
        try {
          const data = await api.get<Task[]>(endpoints.tasks)
          // Normalize dates if backend returns ISO strings
          const normalized = data.map((t) => ({
            ...t,
            deadline: t.deadline ? new Date(t.deadline as unknown as string) : undefined,
            scheduledAt: t.scheduledAt ? new Date(t.scheduledAt as unknown as string) : undefined,
            createdAt: new Date(t.createdAt as unknown as string),
            updatedAt: new Date(t.updatedAt as unknown as string),
          }))
          setTasks(normalized)
        } catch {
          setTasks([])
        }
      } else {
        setTasks([])
      }
      setLoading(false)
    }

    loadTasks()
  }, [isAuthenticated, user])

  const saveTasks = (newTasks: Task[]) => {
    if (!isAuthenticated) return
    setTasks(newTasks)
  }

  const createTask = async (taskData: TaskFormData): Promise<Task | null> => {
    if (!isAuthenticated) return null
    try {
      const created = await api.post<Task, TaskFormData>(endpoints.tasks, taskData)
      const normalized: Task = {
        ...created,
        deadline: created.deadline ? new Date(created.deadline as unknown as string) : undefined,
        scheduledAt: created.scheduledAt ? new Date(created.scheduledAt as unknown as string) : undefined,
        createdAt: new Date(created.createdAt as unknown as string),
        updatedAt: new Date(created.updatedAt as unknown as string),
      }
      saveTasks([...tasks, normalized])
      return normalized
    } catch {
      return null
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    if (!isAuthenticated) return null
    try {
      const updated = await api.put<Task, Partial<Task>>(endpoints.task(id), updates)
      const normalized: Task = {
        ...updated,
        deadline: updated.deadline ? new Date(updated.deadline as unknown as string) : undefined,
        scheduledAt: updated.scheduledAt ? new Date(updated.scheduledAt as unknown as string) : undefined,
        createdAt: new Date(updated.createdAt as unknown as string),
        updatedAt: new Date(updated.updatedAt as unknown as string),
      }
      const idx = tasks.findIndex((t) => t.id === id)
      if (idx === -1) return normalized
      const newTasks = [...tasks]
      newTasks[idx] = normalized
      saveTasks(newTasks)
      return normalized
    } catch {
      return null
    }
  }

  const deleteTask = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false
    try {
      await api.delete<void>(endpoints.task(id))
      const filtered = tasks.filter((t) => t.id !== id)
      saveTasks(filtered)
    return true
    } catch {
      return false
    }
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getTasksByPriority = (priority: number) => {
    return tasks.filter((task) => task.priority === priority)
  }

  const getUpcomingTasks = (days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return tasks
      .filter((task) => task.deadline && task.deadline >= now && task.deadline <= futureDate && task.status !== "done")
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
  }

  const exportTasks = async (): Promise<string> => {
    if (!isAuthenticated) return ""
    const data = await api.get<{ data: string }>(endpoints.tasksExport)
    return data.data
  }

  const importTasks = async (jsonData: string): Promise<boolean> => {
    if (!isAuthenticated) return false
    try {
      const imported = await api.post<Task[]>(endpoints.tasksImport, { data: jsonData })
      const normalized = imported.map((t) => ({
        ...t,
        deadline: t.deadline ? new Date(t.deadline as unknown as string) : undefined,
        scheduledAt: t.scheduledAt ? new Date(t.scheduledAt as unknown as string) : undefined,
        createdAt: new Date(t.createdAt as unknown as string),
        updatedAt: new Date(t.updatedAt as unknown as string),
      }))
      setTasks(normalized)
      return true
    } catch {
      return false
    }
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getUpcomingTasks,
    exportTasks,
    importTasks,
  }
}
