import type { Task } from "./types"

export interface SearchOptions {
  query: string
  status?: Task["status"] | "all"
  priority?: number | "all"
  category?: string | "all"
  tags?: string[]
  dateRange?: {
    start?: Date
    end?: Date
  }
  includeCompleted?: boolean
}

export function searchTasks(tasks: Task[], options: SearchOptions): Task[] {
  const {
    query,
    status = "all",
    priority = "all",
    category = "all",
    tags = [],
    dateRange,
    includeCompleted = true,
  } = options

  return tasks.filter((task) => {
    // Search query - full text search
    if (query.trim()) {
      const searchLower = query.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchLower)
      const matchesDescription = task.description?.toLowerCase().includes(searchLower) ?? false
      const matchesTags = task.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ?? false
      const matchesCategory = task.category?.toLowerCase().includes(searchLower) ?? false

      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesCategory) {
        return false
      }
    }

    // Status filter
    if (status !== "all" && task.status !== status) {
      return false
    }

    // Priority filter
    if (priority !== "all" && task.priority !== priority) {
      return false
    }

    // Category filter
    if (category !== "all" && task.category !== category) {
      return false
    }

    // Tags filter
    if (tags.length > 0) {
      const taskTags = task.tags || []
      const hasMatchingTag = tags.some((tag) => taskTags.includes(tag))
      if (!hasMatchingTag) {
        return false
      }
    }

    // Date range filter
    if (dateRange) {
      if (dateRange.start && task.deadline && task.deadline < dateRange.start) {
        return false
      }
      if (dateRange.end && task.deadline && task.deadline > dateRange.end) {
        return false
      }
    }

    // Include completed filter
    if (!includeCompleted && task.status === "done") {
      return false
    }

    return true
  })
}

export function highlightSearchTerm(text: string, query: string): string {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

export function getSearchSuggestions(tasks: Task[], query: string): string[] {
  if (!query.trim() || query.length < 2) return []

  const queryLower = query.toLowerCase()
  const suggestions = new Set<string>()

  tasks.forEach((task) => {
    // Title suggestions
    if (task.title.toLowerCase().includes(queryLower)) {
      const words = task.title.split(/\s+/)
      words.forEach((word) => {
        if (word.toLowerCase().startsWith(queryLower) && word.length > query.length) {
          suggestions.add(word)
        }
      })
    }

    // Tag suggestions
    task.tags?.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag)
      }
    })

    // Category suggestions
    if (task.category?.toLowerCase().includes(queryLower)) {
      suggestions.add(task.category)
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

