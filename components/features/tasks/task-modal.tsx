"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task, TaskFormData } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubtaskList } from "./subtask-list"
import { Badge } from "@/components/ui/badge"
import { taskCategories, defaultTags } from "@/lib/task-categories"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: TaskFormData) => void
  task?: Task
  templateData?: TaskFormData
}

export function TaskModal({ isOpen, onClose, onSave, task, templateData }: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    deadline: "",
    priority: 3,
    estimatedMinutes: undefined,
    tags: [],
    category: undefined,
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        deadline: task.deadline ? task.deadline.toISOString().slice(0, 16) : "",
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes,
        tags: task.tags || [],
        category: task.category,
      })
    } else if (templateData) {
      setFormData({
        title: templateData.title || "",
        description: templateData.description || "",
        deadline: templateData.deadline || "",
        priority: templateData.priority || 3,
        estimatedMinutes: templateData.estimatedMinutes,
        tags: templateData.tags || [],
        category: templateData.category,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        deadline: "",
        priority: 3,
        estimatedMinutes: undefined,
        tags: [],
        category: undefined,
      })
    }
  }, [task, templateData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSave(formData)
    onClose()
  }

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Chỉnh sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Nhập tiêu đề nhiệm vụ..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả chi tiết nhiệm vụ..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Độ ưu tiên</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => handleChange("priority", Number.parseInt(value) as 1 | 2 | 3 | 4 | 5)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Thấp nhất</SelectItem>
                  <SelectItem value="2">2 - Thấp</SelectItem>
                  <SelectItem value="3">3 - Trung bình</SelectItem>
                  <SelectItem value="4">4 - Cao</SelectItem>
                  <SelectItem value="5">5 - Cao nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Thời gian dự kiến (phút)</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                value={formData.estimatedMinutes || ""}
                onChange={(e) =>
                  handleChange("estimatedMinutes", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
                placeholder="60"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Hạn chót</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Danh mục</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => handleChange("category", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không có</SelectItem>
                {taskCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags?.filter((t) => t !== tag) || []
                      handleChange("tags", newTags)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Thêm tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
                      handleChange("tags", [...(formData.tags || []), newTag.trim()])
                      setNewTag("")
                    }
                  }
                }}
              />
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.tags?.includes(value)) {
                    handleChange("tags", [...(formData.tags || []), value])
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tag nhanh" />
                </SelectTrigger>
                <SelectContent>
                  {defaultTags
                    .filter((tag) => !formData.tags?.includes(tag))
                    .map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subtasks - Only show when editing existing task */}
          {task && (
            <div className="space-y-2 pt-2 border-t">
              <SubtaskList taskId={task.id} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{task ? "Cập nhật" : "Tạo mới"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

