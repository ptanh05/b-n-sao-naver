"use client"

import { useEffect, useRef } from "react"
import type { Task } from "@/lib/types"
import { notificationService } from "@/lib/notifications"

interface ReminderConfig {
  enabled: boolean
  beforeDeadlineHours: number[]
  checkInterval: number // in minutes
}

const DEFAULT_CONFIG: ReminderConfig = {
  enabled: true,
  beforeDeadlineHours: [24, 12, 6, 3, 1, 0.5], // Remind 24h, 12h, 6h, 3h, 1h, 30min before deadline
  checkInterval: 5, // Check every 5 minutes
}

export function useReminders(tasks: Task[], config: Partial<ReminderConfig> = {}) {
  const reminderConfig = { ...DEFAULT_CONFIG, ...config }
  const sentRemindersRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!reminderConfig.enabled) return

    // Request notification permission
    notificationService.requestPermission()

    const checkReminders = () => {
      const now = new Date()
      const tasksWithDeadlines = tasks.filter(
        (task) => task.deadline && task.status !== "done" && task.status !== "cancelled"
      )

      tasksWithDeadlines.forEach((task) => {
        if (!task.deadline) return

        const deadline = new Date(task.deadline)
        const timeUntilDeadline = deadline.getTime() - now.getTime()
        const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

        // Check each reminder threshold
        reminderConfig.beforeDeadlineHours.forEach((hoursBefore) => {
          const reminderKey = `${task.id}-${hoursBefore}`
          const shouldRemind =
            hoursUntilDeadline <= hoursBefore &&
            hoursUntilDeadline > hoursBefore - reminderConfig.checkInterval / 60 &&
            !sentRemindersRef.current.has(reminderKey)

          if (shouldRemind && hoursUntilDeadline >= 0) {
            notificationService.showTaskReminder(task.title, deadline)
            sentRemindersRef.current.add(reminderKey)
          }
        })
      })
    }

    // Check immediately
    checkReminders()

    // Set up interval
    intervalRef.current = setInterval(checkReminders, reminderConfig.checkInterval * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [tasks, reminderConfig])

  // Clear sent reminders when tasks change
  useEffect(() => {
    sentRemindersRef.current.clear()
  }, [tasks.length])
}

