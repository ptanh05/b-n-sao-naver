"use client"

import { useState, useEffect } from "react"
import { api, endpoints } from "@/lib/api"

export interface Habit {
  id: string
  name: string
  status?: string
  last_checked?: string
  user_id: string
  created_at: string
}

export interface HabitCompletion {
  habitId: string
  date: string
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [completions, setCompletions] = useState<HabitCompletion[]>([])

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    setLoading(true)
    try {
      const data = await api.get<Habit[]>(endpoints.habits)
      setHabits(data)
    } catch {
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async (name: string): Promise<Habit | null> => {
    try {
      const created = await api.post<Habit, { name: string }>(endpoints.habits, { name })
      setHabits([...habits, created])
      return created
    } catch {
      return null
    }
  }

  const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit | null> => {
    try {
      const updated = await api.put<Habit, Partial<Habit>>(endpoints.habit(id), updates)
      setHabits(habits.map((h) => (h.id === id ? updated : h)))
      return updated
    } catch {
      return null
    }
  }

  const deleteHabit = async (id: string): Promise<boolean> => {
    try {
      await api.delete<void>(endpoints.habit(id))
      setHabits(habits.filter((h) => h.id !== id))
      return true
    } catch {
      return false
    }
  }

  const toggleHabitCompletion = async (habitId: string, date: string): Promise<boolean> => {
    try {
      // Update last_checked to the most recent completion date
      await updateHabit(habitId, { last_checked: date })
      return true
    } catch {
      return false
    }
  }

  return {
    habits,
    loading,
    completions,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    refreshHabits: loadHabits,
  }
}

