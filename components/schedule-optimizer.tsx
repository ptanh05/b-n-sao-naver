"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { suggestOptimalSchedule, generateDefaultTimeSlots, type ScheduleSuggestion } from "@/lib/scheduling-algorithm"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ScheduleOptimizerProps {
  tasks: Task[]
  onScheduleTask: (taskId: string, scheduledAt: Date) => void
}

export function ScheduleOptimizer({ tasks, onScheduleTask }: ScheduleOptimizerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [speedFactor, setSpeedFactor] = useState(1.0)

  const scheduleSuggestion: ScheduleSuggestion = useMemo(() => {
    const timeSlots = generateDefaultTimeSlots(selectedDate)
    return suggestOptimalSchedule(tasks, timeSlots, speedFactor)
  }, [tasks, selectedDate, speedFactor])

  const applySchedule = () => {
    scheduleSuggestion.scheduledTasks.forEach((scheduledTask) => {
      onScheduleTask(scheduledTask.taskId, scheduledTask.start)
    })
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-800 border-red-200"
    if (priority >= 3) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚡</span>
            Tối ưu hóa lịch học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Ngày lên lịch</label>
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Tốc độ làm việc</label>
              <select
                value={speedFactor}
                onChange={(e) => setSpeedFactor(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value={0.8}>Chậm (80%)</option>
                <option value={1.0}>Bình thường (100%)</option>
                <option value={1.2}>Nhanh (120%)</option>
                <option value={1.5}>Rất nhanh (150%)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiệu suất: {scheduleSuggestion.efficiency.toFixed(1)}% • Thời gian:{" "}
              {Math.round(scheduleSuggestion.totalScheduledTime / 60)}h
            </div>
            <Button onClick={applySchedule} disabled={scheduleSuggestion.scheduledTasks.length === 0}>
              Áp dụng lịch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Tasks */}
      {scheduleSuggestion.scheduledTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📅</span>
              Lịch được đề xuất ({scheduleSuggestion.scheduledTasks.length} nhiệm vụ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleSuggestion.scheduledTasks.map((scheduledTask, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{scheduledTask.title}</h4>
                      <Badge className={getPriorityColor(scheduledTask.priority)}>
                        Ưu tiên {scheduledTask.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span>⏰</span>
                        {format(scheduledTask.start, "HH:mm", { locale: vi })} -
                        {format(scheduledTask.end, "HH:mm", { locale: vi })}
                      </span>
                      <span>{Math.round(scheduledTask.duration)} phút</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unscheduled Tasks */}
      {scheduleSuggestion.unscheduledTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <span>🎯</span>
              Nhiệm vụ chưa lên lịch ({scheduleSuggestion.unscheduledTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scheduleSuggestion.unscheduledTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{task.title}</span>
                  <Badge variant="outline">{task.estimatedMinutes || 60} phút</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Các nhiệm vụ này không thể lên lịch trong khung thời gian có sẵn. Hãy thử giảm thời gian ước tính hoặc
              thêm khung thời gian mới.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
