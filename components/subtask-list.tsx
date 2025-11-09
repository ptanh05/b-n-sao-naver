"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useSubtasks } from "@/hooks/use-subtasks"
import type { Subtask } from "@/lib/types"
import { Trash2, Plus } from "lucide-react"

interface SubtaskListProps {
  taskId: string
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const { subtasks, loading, createSubtask, deleteSubtask, toggleSubtask } = useSubtasks(taskId)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    const created = await createSubtask(newSubtaskTitle.trim())
    if (created) {
      setNewSubtaskTitle("")
      setIsAdding(false)
    }
  }

  const handleToggle = async (id: string) => {
    await toggleSubtask(id)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa subtask này?")) {
      await deleteSubtask(id)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Đang tải subtasks...</div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subtasks ({subtasks.length})</h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Thêm
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2">
          <Input
            placeholder="Tên subtask..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" onClick={handleAddSubtask} className="h-8">
            Thêm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAdding(false)
              setNewSubtaskTitle("")
            }}
            className="h-8"
          >
            Hủy
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => handleToggle(subtask.id)}
            />
            <span
              className={`flex-1 text-sm ${
                subtask.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(subtask.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {subtasks.length === 0 && !isAdding && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Chưa có subtask nào. Nhấn "Thêm" để tạo subtask đầu tiên.
        </div>
      )}
    </div>
  )
}

