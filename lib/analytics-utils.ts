import type { Task } from "./types"

export interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime: number
  productivityStreak: number
  tasksByPriority: { priority: number; count: number }[]
  tasksByStatus: { status: string; count: number; color: string }[]
  dailyProductivity: { date: string; completed: number; created: number }[]
  weeklyProductivity: { week: string; completed: number; created: number }[]
  timeSpentByPriority: { priority: number; totalMinutes: number }[]
}

export const analyticsUtils = {
  calculateAnalytics: (tasks: Task[]): AnalyticsData => {
    const now = new Date()
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "done").length
    const pendingTasks = tasks.filter((task) => task.status === "todo" || task.status === "in_progress").length
    const overdueTasks = tasks.filter((task) => task.deadline && task.deadline < now && task.status !== "done").length

    const completionRate = calculateCompletionRate(tasks)

    // Calculate average completion time
    const averageCompletionTime = calculateAverageCompletionTime(tasks)

    // Calculate productivity streak (consecutive days with completed tasks)
    const productivityStreak = calculateProductivityStreak(tasks)

    // Tasks by priority
    const tasksByPriority = getTasksByPriority(tasks)

    // Tasks by status
    const tasksByStatus = [
      { status: "Chưa làm", count: tasks.filter((t) => t.status === "todo").length, color: "#fbbf24" },
      { status: "Đang làm", count: tasks.filter((t) => t.status === "in_progress").length, color: "#3b82f6" },
      { status: "Hoàn thành", count: tasks.filter((t) => t.status === "done").length, color: "#10b981" },
      { status: "Đã hủy", count: tasks.filter((t) => t.status === "cancelled").length, color: "#6b7280" },
    ]

    // Daily productivity (last 7 days)
    const dailyProductivity = analyticsUtils.getDailyProductivity(tasks, 7)

    // Weekly productivity (last 4 weeks)
    const weeklyProductivity = analyticsUtils.getWeeklyProductivity(tasks, 4)

    // Time spent by priority
    const timeSpentByPriority = [1, 2, 3, 4, 5].map((priority) => ({
      priority,
      totalMinutes: tasks
        .filter((task) => task.priority === priority && task.status === "done" && task.estimatedMinutes)
        .reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0),
    }))

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      productivityStreak,
      tasksByPriority,
      tasksByStatus,
      dailyProductivity,
      weeklyProductivity,
      timeSpentByPriority,
    }
  },

  calculateProductivityStreak: (tasks: Task[]): number => {
    const completedTasks = tasks.filter((task) => task.status === "done")
    if (completedTasks.length === 0) return 0

    const today = new Date()
    let streak = 0
    const currentDate = new Date(today)

    // Check each day going backwards
    for (let i = 0; i < 30; i++) {
      // Check last 30 days max
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const hasCompletedTask = completedTasks.some((task) => {
        const updatedAt = new Date(task.updatedAt)
        return updatedAt >= dayStart && updatedAt <= dayEnd
      })

      if (hasCompletedTask) {
        streak++
      } else if (i > 0) {
        // Don't break on first day (today might not have completed tasks yet)
        break
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  },

  getDailyProductivity: (tasks: Task[], days: number) => {
    const result = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" })

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const completed = tasks.filter((task) => {
        const updatedAt = new Date(task.updatedAt)
        return task.status === "done" && updatedAt >= dayStart && updatedAt <= dayEnd
      }).length

      const created = tasks.filter((task) => {
        const createdAt = new Date(task.createdAt)
        return createdAt >= dayStart && createdAt <= dayEnd
      }).length

      result.push({ date: dateStr, completed, created })
    }

    return result
  },

  getWeeklyProductivity: (tasks: Task[], weeks: number) => {
    const result = []
    const today = new Date()

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - i * 7 - today.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekStr = `Tuần ${weekStart.getDate()}/${weekStart.getMonth() + 1}`

      const completed = tasks.filter((task) => {
        const updatedAt = new Date(task.updatedAt)
        return task.status === "done" && updatedAt >= weekStart && updatedAt <= weekEnd
      }).length

      const created = tasks.filter((task) => {
        const createdAt = new Date(task.createdAt)
        return createdAt >= weekStart && createdAt <= weekEnd
      }).length

      result.push({ week: weekStr, completed, created })
    }

    return result
  },

  formatMinutes: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} phút`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} giờ`
    }
    return `${hours}g ${remainingMinutes}p`
  },

  getPriorityLabel: (priority: number): string => {
    const labels = {
      1: "Thấp nhất",
      2: "Thấp",
      3: "Trung bình",
      4: "Cao",
      5: "Cao nhất",
    }
    return labels[priority as keyof typeof labels] || "Không xác định"
  },
}

export const calculateCompletionRate = (tasks: Task[]): number => {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "done").length
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
}

export const calculateProductivityStreak = (tasks: Task[]): number => {
  return analyticsUtils.calculateProductivityStreak(tasks)
}

export const getOverdueTasks = (tasks: Task[]): Task[] => {
  const now = new Date()
  return tasks.filter((task) => task.deadline && task.deadline < now && task.status !== "done")
}

export const calculateAverageCompletionTime = (tasks: Task[]): number => {
  const completedTasksWithTime = tasks.filter((task) => task.status === "done" && task.estimatedMinutes)
  return completedTasksWithTime.length > 0
    ? completedTasksWithTime.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0) /
        completedTasksWithTime.length
    : 0
}

export const getTasksByPriority = (tasks: Task[]) => {
  return [1, 2, 3, 4, 5].map((priority) => {
    const priorityTasks = tasks.filter((task) => task.priority === priority)
    const completed = priorityTasks.filter((task) => task.status === "done").length
    return {
      priority,
      total: priorityTasks.length,
      completed,
    }
  })
}
