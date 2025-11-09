"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { calendarUtils } from "@/lib/calendar-utils"
import { timeUtils } from "@/lib/time-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onDateClick: (date: Date) => void
}

type CalendarMode = "month" | "week"

export function CalendarView({ tasks, onTaskClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mode, setMode] = useState<CalendarMode>("month")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(month - 1)
    } else {
      newDate.setMonth(month + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setDate(currentDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const renderMonthView = () => {
    const dates = calendarUtils.getMonthDates(year, month)
    const weeks = []

    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7))
    }

    return (
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {calendarUtils.getDayName(day)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = date.getMonth() === month
                const isToday = calendarUtils.isToday(date)
                const dayTasks = calendarUtils.getTasksForDate(tasks, date)
                const hasOverdueTasks = dayTasks.some(
                  (task) => timeUtils.isOverdue(task.deadline) && task.status !== "done",
                )

                return (
                  <Card
                    key={dayIndex}
                    className={cn(
                      "min-h-[100px] cursor-pointer transition-all hover:shadow-md",
                      !isCurrentMonth && "opacity-40",
                      isToday && "ring-2 ring-primary",
                      hasOverdueTasks && "ring-2 ring-red-500",
                    )}
                    onClick={() => onDateClick(date)}
                  >
                    <CardContent className="p-2">
                      <div className={cn("text-sm font-medium mb-2", isToday && "text-primary font-bold")}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => {
                          const urgency = timeUtils.getDeadlineUrgency(task.deadline)
                          return (
                            <div
                              key={task.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                onTaskClick(task)
                              }}
                              className={cn(
                                "text-xs p-1 rounded cursor-pointer truncate",
                                urgency === "urgent" && "bg-red-100 text-red-800",
                                urgency === "medium" && "bg-amber-100 text-amber-800",
                                urgency === "low" && "bg-green-100 text-green-800",
                                urgency === "none" && "bg-gray-100 text-gray-800",
                                task.status === "done" && "line-through opacity-60",
                              )}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          )
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} khác</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDates = calendarUtils.getWeekDates(currentDate)

    return (
      <div className="space-y-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const isToday = calendarUtils.isToday(date)
            const dayTasks = calendarUtils.getTasksForDate(tasks, date)

            return (
              <div key={index} className="text-center">
                <div className={cn("text-sm font-medium mb-2", isToday && "text-primary font-bold")}>
                  {calendarUtils.getDayName(date.getDay())}
                </div>
                <div className={cn("text-2xl font-bold mb-4", isToday && "text-primary")}>{date.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const isToday = calendarUtils.isToday(date)
            const dayTasks = calendarUtils.getTasksForDate(tasks, date)

            return (
              <Card
                key={index}
                className={cn(
                  "min-h-[300px] cursor-pointer transition-all hover:shadow-md",
                  isToday && "ring-2 ring-primary",
                )}
                onClick={() => onDateClick(date)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {dayTasks.map((task) => {
                      const urgency = timeUtils.getDeadlineUrgency(task.deadline)
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskClick(task)
                          }}
                          className={cn(
                            "text-sm p-2 rounded cursor-pointer",
                            urgency === "urgent" && "bg-red-100 text-red-800 border border-red-200",
                            urgency === "medium" && "bg-amber-100 text-amber-800 border border-amber-200",
                            urgency === "low" && "bg-green-100 text-green-800 border border-green-200",
                            urgency === "none" && "bg-gray-100 text-gray-800 border border-gray-200",
                            task.status === "done" && "line-through opacity-60",
                          )}
                        >
                          <div className="font-medium truncate" title={task.title}>
                            {task.title}
                          </div>
                          {task.estimatedMinutes && (
                            <div className="text-xs opacity-75 mt-1">{task.estimatedMinutes} phút</div>
                          )}
                          <Badge variant="outline" className="text-xs mt-1">
                            Ưu tiên {task.priority}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {mode === "month"
              ? `${calendarUtils.getMonthName(month)} ${year}`
              : `Tuần ${Math.ceil(currentDate.getDate() / 7)}, ${calendarUtils.getMonthName(month)} ${year}`}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hôm nay
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={mode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("month")}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              Tháng
            </Button>
            <Button
              variant={mode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("week")}
              className="flex items-center gap-1"
            >
              <List className="h-4 w-4" />
              Tuần
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (mode === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (mode === "month" ? navigateMonth("next") : navigateWeek("next"))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {mode === "month" ? renderMonthView() : renderWeekView()}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Khẩn cấp</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div>
          <span>Trung bình</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Thấp</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-primary rounded"></div>
          <span>Hôm nay</span>
        </div>
      </div>
    </div>
  )
}

