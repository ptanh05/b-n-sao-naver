import type { TaskFormData } from "./types"

export interface TaskTemplate {
  id: string
  name: string
  description?: string
  icon?: string
  category: string
  template: TaskFormData
}

export const defaultTemplates: TaskTemplate[] = [
  {
    id: "study-session",
    name: "Buổi học",
    description: "Template cho buổi học thông thường",
    icon: "📚",
    category: "Học tập",
    template: {
      title: "Buổi học",
      description: "Ôn tập và học bài",
      priority: 3,
      estimatedMinutes: 120,
    },
  },
  {
    id: "assignment",
    name: "Bài tập",
    description: "Template cho bài tập về nhà",
    icon: "📝",
    category: "Học tập",
    template: {
      title: "Bài tập",
      description: "Hoàn thành bài tập",
      priority: 4,
      estimatedMinutes: 90,
    },
  },
  {
    id: "project",
    name: "Dự án",
    description: "Template cho dự án lớn",
    icon: "💼",
    category: "Công việc",
    template: {
      title: "Dự án",
      description: "Làm việc trên dự án",
      priority: 5,
      estimatedMinutes: 240,
    },
  },
  {
    id: "meeting",
    name: "Cuộc họp",
    description: "Template cho cuộc họp",
    icon: "👥",
    category: "Công việc",
    template: {
      title: "Cuộc họp",
      description: "Tham gia cuộc họp",
      priority: 3,
      estimatedMinutes: 60,
    },
  },
  {
    id: "exercise",
    name: "Tập thể dục",
    description: "Template cho hoạt động thể dục",
    icon: "🏃",
    category: "Sức khỏe",
    template: {
      title: "Tập thể dục",
      description: "Tập thể dục và vận động",
      priority: 2,
      estimatedMinutes: 60,
    },
  },
  {
    id: "reading",
    name: "Đọc sách",
    description: "Template cho việc đọc sách",
    icon: "📖",
    category: "Học tập",
    template: {
      title: "Đọc sách",
      description: "Đọc và nghiên cứu tài liệu",
      priority: 2,
      estimatedMinutes: 90,
    },
  },
]

export function getTemplatesByCategory(templates: TaskTemplate[]): Record<string, TaskTemplate[]> {
  return templates.reduce((acc, template) => {
    const category = template.category || "Khác"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, TaskTemplate[]>)
}

export function createTaskFromTemplate(template: TaskTemplate, customizations?: Partial<TaskFormData>): TaskFormData {
  return {
    ...template.template,
    ...customizations,
    title: customizations?.title || template.template.title,
  }
}

