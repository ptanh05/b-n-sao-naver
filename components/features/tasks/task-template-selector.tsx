"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { defaultTemplates, getTemplatesByCategory, type TaskTemplate, createTaskFromTemplate } from "@/lib/task-templates"
import type { TaskFormData } from "@/lib/types"
import { Search } from "lucide-react"

interface TaskTemplateSelectorProps {
  onSelectTemplate: (template: TaskFormData) => void
}

export function TaskTemplateSelector({ onSelectTemplate }: TaskTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTemplates = defaultTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const templatesByCategory = getTemplatesByCategory(filteredTemplates)
  const categories = Array.from(new Set(defaultTemplates.map((t) => t.category)))

  const handleSelectTemplate = (template: TaskTemplate) => {
    const taskData = createTaskFromTemplate(template)
    onSelectTemplate(taskData)
    setIsOpen(false)
    setSearchQuery("")
    setSelectedCategory(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>📋</span>
          <span className="hidden sm:inline">Từ template</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn template</DialogTitle>
          <DialogDescription>
            Chọn một template để tạo nhiệm vụ nhanh chóng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates */}
          <div className="space-y-4">
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category}>
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{template.icon || "📋"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {template.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Ưu tiên {template.template.priority}
                            </Badge>
                            {template.template.estimatedMinutes && (
                              <Badge variant="outline" className="text-xs">
                                {template.template.estimatedMinutes} phút
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không tìm thấy template nào phù hợp</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

