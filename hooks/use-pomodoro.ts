"use client"

import { useState, useEffect } from "react"
import { api, endpoints } from "@/lib/api"

export interface PomodoroSession {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  status?: string
  created_at: string
}

export function usePomodoro() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await api.get<PomodoroSession[]>(endpoints.pomodoroSessions)
      setSessions(data)
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (startTime: Date, endTime?: Date, status?: string): Promise<PomodoroSession | null> => {
    try {
      const created = await api.post<PomodoroSession, { start_time: string; end_time?: string; status?: string }>(
        endpoints.pomodoroSessions,
        {
          start_time: startTime.toISOString(),
          end_time: endTime?.toISOString(),
          status: status || "completed",
        }
      )
      setSessions([created, ...sessions])
      return created
    } catch {
      return null
    }
  }

  const updateSession = async (id: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | null> => {
    try {
      const updated = await api.put<PomodoroSession, Partial<PomodoroSession>>(
        endpoints.pomodoroSession(id),
        updates
      )
      setSessions(sessions.map((s) => (s.id === id ? updated : s)))
      return updated
    } catch {
      return null
    }
  }

  const deleteSession = async (id: string): Promise<boolean> => {
    try {
      await api.delete<void>(endpoints.pomodoroSession(id))
      setSessions(sessions.filter((s) => s.id !== id))
      return true
    } catch {
      return false
    }
  }

  const getTodaySessions = (): PomodoroSession[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return sessions.filter((session) => {
      const createdAt = new Date(session.created_at)
      return createdAt >= today && createdAt < tomorrow
    })
  }

  return {
    sessions,
    loading,
    createSession,
    updateSession,
    deleteSession,
    getTodaySessions,
    refreshSessions: loadSessions,
  }
}

