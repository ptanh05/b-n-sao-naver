"use client"

import type { Task } from "@/lib/types"
import { timeUtils } from "@/lib/time-utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Task["status"]) => void
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const urgency = timeUtils.getDeadlineUrgency(task.deadline)
  const urgencyColor = timeUtils.getUrgencyColor(urgency)
  const isOverdue = timeUtils.isOverdue(task.deadline)

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return "bg-red-100 text-red-800 border-red-200"
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 1:
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        task.status === "done" && "opacity-75",
        isOverdue && task.status !== "done" && "ring-2 ring-red-200",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3
              className={cn(
                "font-semibold text-lg leading-tight",
                task.status === "done" && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </h3>
            {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
          </div>
          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 p-0">
              <span className="text-sm">✏️</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <span className="text-sm">🗑️</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            Ưu tiên {task.priority}
          </Badge>
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status === "todo" && "Chưa làm"}
            {task.status === "in_progress" && "Đang làm"}
            {task.status === "done" && "Hoàn thành"}
            {task.status === "cancelled" && "Đã hủy"}
          </Badge>
          {task.deadline && (
            <Badge variant="outline" className={urgencyColor}>
              {isOverdue ? "Quá hạn" : `${timeUtils.getDaysUntilDeadline(task.deadline)} ngày`}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {task.deadline && (
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{timeUtils.formatDateTime(task.deadline)}</span>
            </div>
          )}
          {task.estimatedMinutes && (
            <div className="flex items-center gap-1">
              <span>⏰</span>
              <span>{task.estimatedMinutes} phút</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {task.status !== "done" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, "done")}
              className="flex items-center gap-1"
            >
              <span>✅</span>
              Hoàn thành
            </Button>
          )}
          {task.status === "todo" && (
            <Button variant="outline" size="sm" onClick={() => onStatusChange(task.id, "in_progress")}>
              Bắt đầu
            </Button>
          )}
          {task.status === "done" && (
            <Button variant="outline" size="sm" onClick={() => onStatusChange(task.id, "todo")}>
              Hoàn tác
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
