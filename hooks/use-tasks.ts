"use client"

import { useState, useEffect } from "react"
import type { Task, TaskFormData } from "@/lib/types"
import { storage } from "@/lib/storage"
import { useAuth } from "./use-auth"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const loadTasks = () => {
      if (isAuthenticated) {
        const savedTasks = storage.getTasks()
        setTasks(savedTasks)
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
    storage.saveTasks(newTasks)
  }

  const createTask = (taskData: TaskFormData): Task | null => {
    if (!isAuthenticated) return null

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
      status: "todo",
      priority: taskData.priority,
      estimatedMinutes: taskData.estimatedMinutes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedTasks = [...tasks, newTask]
    saveTasks(updatedTasks)
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>): Task | null => {
    if (!isAuthenticated) return null

    const taskIndex = tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return null

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    }

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = updatedTask
    saveTasks(updatedTasks)
    return updatedTask
  }

  const deleteTask = (id: string): boolean => {
    if (!isAuthenticated) return false

    const filteredTasks = tasks.filter((task) => task.id !== id)
    if (filteredTasks.length === tasks.length) return false

    saveTasks(filteredTasks)
    return true
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

  const exportTasks = () => {
    if (!isAuthenticated) return ""
    return storage.exportTasks()
  }

  const importTasks = (jsonData: string) => {
    if (!isAuthenticated) return false
    try {
      const importedTasks = storage.importTasks(jsonData)
      setTasks(importedTasks)
      return true
    } catch (error) {
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
