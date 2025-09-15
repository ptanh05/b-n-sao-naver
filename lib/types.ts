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

// Auth-related types moved here to remove dependency on local auth manager
export interface User {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
