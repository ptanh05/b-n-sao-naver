import type { Task } from "./types"
import { addMinutes, isAfter, isBefore, startOfDay } from "date-fns"

export interface TimeSlot {
  start: Date
  end: Date
  duration: number // minutes
}

export interface ScheduledTask {
  taskId: string
  title: string
  start: Date
  end: Date
  duration: number
  priority: number
}

export interface ScheduleSuggestion {
  scheduledTasks: ScheduledTask[]
  unscheduledTasks: Task[]
  totalScheduledTime: number
  efficiency: number
}

export function suggestOptimalSchedule(
  tasks: Task[],
  availableSlots: TimeSlot[],
  speedFactor = 1.0,
  breakDuration = 10,
): ScheduleSuggestion {
  // Filter incomplete tasks and sort by priority score
  const incompleteTasks = tasks.filter((task) => task.status !== "done" && task.status !== "cancelled")
  const sortedTasks = [...incompleteTasks].sort((a, b) => calculateTaskScore(b) - calculateTaskScore(a))

  const scheduledTasks: ScheduledTask[] = []
  const unscheduledTasks: Task[] = []
  let totalScheduledTime = 0

  for (const slot of availableSlots) {
    let currentTime = slot.start
    const slotEnd = slot.end

    while (sortedTasks.length > 0 && isBefore(currentTime, slotEnd)) {
      const task = sortedTasks.shift()!
      const estimatedDuration = (task.estimatedMinutes || 60) * speedFactor
      const taskEndTime = addMinutes(currentTime, estimatedDuration)

      // Check if task fits in remaining slot time
      if (isAfter(taskEndTime, slotEnd)) {
        unscheduledTasks.push(task)
        continue
      }

      scheduledTasks.push({
        taskId: task.id,
        title: task.title,
        start: currentTime,
        end: taskEndTime,
        duration: estimatedDuration,
        priority: task.priority,
      })

      totalScheduledTime += estimatedDuration
      currentTime = addMinutes(taskEndTime, breakDuration)
    }

    // Add remaining tasks to unscheduled
    unscheduledTasks.push(...sortedTasks.splice(0))
  }

  const efficiency = incompleteTasks.length > 0 ? (scheduledTasks.length / incompleteTasks.length) * 100 : 100

  return {
    scheduledTasks,
    unscheduledTasks,
    totalScheduledTime,
    efficiency,
  }
}

function calculateTaskScore(task: Task): number {
  let score = task.priority * 20 // Base priority score

  if (task.deadline) {
    const now = new Date()
    const deadline = new Date(task.deadline)
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Urgency bonus (more urgent = higher score)
    if (hoursUntilDeadline < 24) score += 50
    else if (hoursUntilDeadline < 72) score += 30
    else if (hoursUntilDeadline < 168) score += 10
  }

  // Estimated time factor (shorter tasks get slight bonus for quick wins)
  const estimatedHours = (task.estimatedMinutes || 60) / 60
  if (estimatedHours <= 1) score += 5

  return score
}

export function generateDefaultTimeSlots(date: Date): TimeSlot[] {
  const dayStart = startOfDay(date)

  return [
    {
      start: addMinutes(dayStart, 9 * 60), // 9 AM
      end: addMinutes(dayStart, 12 * 60), // 12 PM
      duration: 180,
    },
    {
      start: addMinutes(dayStart, 14 * 60), // 2 PM
      end: addMinutes(dayStart, 17 * 60), // 5 PM
      duration: 180,
    },
    {
      start: addMinutes(dayStart, 19 * 60), // 7 PM
      end: addMinutes(dayStart, 22 * 60), // 10 PM
      duration: 180,
    },
  ]
}
