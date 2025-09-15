export const timeUtils = {
  formatDate: (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  formatDateTime: (date: Date): string => {
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  getDeadlineUrgency: (deadline?: Date): "urgent" | "medium" | "low" | "none" => {
    if (!deadline) return "none"

    const now = new Date()
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) return "urgent" // Overdue
    if (diffHours < 24) return "urgent" // Less than 1 day
    if (diffHours < 72) return "medium" // Less than 3 days
    return "low" // More than 3 days
  },

  getUrgencyColor: (urgency: "urgent" | "medium" | "low" | "none"): string => {
    switch (urgency) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  },

  getDaysUntilDeadline: (deadline?: Date): number => {
    if (!deadline) return Number.POSITIVE_INFINITY
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  isOverdue: (deadline?: Date): boolean => {
    if (!deadline) return false
    return deadline.getTime() < new Date().getTime()
  },
}
