export const taskCategories = [
  { id: "study", name: "Học tập", icon: "📚", color: "bg-blue-100 text-blue-800" },
  { id: "work", name: "Công việc", icon: "💼", color: "bg-purple-100 text-purple-800" },
  { id: "personal", name: "Cá nhân", icon: "👤", color: "bg-green-100 text-green-800" },
  { id: "health", name: "Sức khỏe", icon: "🏃", color: "bg-red-100 text-red-800" },
  { id: "social", name: "Xã hội", icon: "👥", color: "bg-yellow-100 text-yellow-800" },
  { id: "shopping", name: "Mua sắm", icon: "🛒", color: "bg-pink-100 text-pink-800" },
  { id: "finance", name: "Tài chính", icon: "💰", color: "bg-emerald-100 text-emerald-800" },
  { id: "other", name: "Khác", icon: "📋", color: "bg-gray-100 text-gray-800" },
] as const

export const defaultTags = [
  "Quan trọng",
  "Khẩn cấp",
  "Dự án",
  "Bài tập",
  "Thi cử",
  "Nhóm",
  "Cá nhân",
  "Học tập",
  "Công việc",
  "Sức khỏe",
] as const

export function getCategoryById(id: string) {
  return taskCategories.find((cat) => cat.id === id) || taskCategories[taskCategories.length - 1]
}

export function getCategoryColor(id: string) {
  const category = getCategoryById(id)
  return category.color
}

