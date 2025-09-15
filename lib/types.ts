export interface Task {
  id: string
  title: string
  description?: string
  deadline?: Date
  status: "todo" | "in_progress" | "done" | "cancelled"
  priority: 1 | 2 | 3 | 4 | 5
  estimatedMinutes?: number
  scheduledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TaskFormData {
  title: string
  description?: string
  deadline?: string
  priority: 1 | 2 | 3 | 4 | 5
  estimatedMinutes?: number
}

export type ViewMode = "list" | "calendar" | "priority" | "analytics" | "schedule" | "insights"
