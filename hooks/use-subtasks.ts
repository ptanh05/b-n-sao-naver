"use client"

import { useState, useEffect } from "react"
import { api, endpoints } from "@/lib/api"
import type { Subtask } from "@/lib/types"

export function useSubtasks(taskId: string | null) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (taskId) {
      loadSubtasks()
    } else {
      setSubtasks([])
      setLoading(false)
    }
  }, [taskId])

  const loadSubtasks = async () => {
    if (!taskId) return
    setLoading(true)
    try {
      const data = await api.get<Subtask[]>(endpoints.subtasksByTask(taskId))
      setSubtasks(data)
    } catch {
      setSubtasks([])
    } finally {
      setLoading(false)
    }
  }

  const createSubtask = async (title: string, order?: number): Promise<Subtask | null> => {
    if (!taskId) return null
    try {
      const created = await api.post<Subtask, { taskId: string; title: string; order?: number }>(
        endpoints.subtasks,
        { taskId, title, order }
      )
      setSubtasks([...subtasks, created])
      return created
    } catch {
      return null
    }
  }

  const updateSubtask = async (id: string, updates: Partial<Subtask>): Promise<Subtask | null> => {
    try {
      const updated = await api.put<Subtask, Partial<Subtask>>(endpoints.subtask(id), updates)
      setSubtasks(subtasks.map((s) => (s.id === id ? updated : s)))
      return updated
    } catch {
      return null
    }
  }

  const deleteSubtask = async (id: string): Promise<boolean> => {
    try {
      await api.delete<void>(endpoints.subtask(id))
      setSubtasks(subtasks.filter((s) => s.id !== id))
      return true
    } catch {
      return false
    }
  }

  const toggleSubtask = async (id: string): Promise<boolean> => {
    const subtask = subtasks.find((s) => s.id === id)
    if (!subtask) return false
    return (await updateSubtask(id, { completed: !subtask.completed })) !== null
  }

  return {
    subtasks,
    loading,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    refreshSubtasks: loadSubtasks,
  }
}

