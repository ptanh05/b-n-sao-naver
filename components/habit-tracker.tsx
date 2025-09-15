"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from "date-fns"
import { vi } from "date-fns/locale"

interface Habit {
  id: string
  name: string
  description?: string
  color: string
  createdAt: Date
  completions: Date[]
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isAddingHabit, setIsAddingHabit] = useState(false)

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      const parsed = JSON.parse(savedHabits)
      setHabits(
        parsed.map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
          completions: h.completions.map((c: string) => new Date(c)),
        })),
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "habits",
      JSON.stringify(
        habits.map((h) => ({
          ...h,
          createdAt: h.createdAt.toISOString(),
          completions: h.completions.map((c) => c.toISOString()),
        })),
      ),
    )
  }, [habits])

  const addHabit = () => {
    if (!newHabitName.trim()) return

    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500", "bg-pink-500"]
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      color: colors[habits.length % colors.length],
      createdAt: new Date(),
      completions: [],
    }

    setHabits([...habits, newHabit])
    setNewHabitName("")
    setIsAddingHabit(false)
  }

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id !== habitId) return habit

        const completions = [...habit.completions]
        const existingIndex = completions.findIndex((c) => isSameDay(c, date))

        if (existingIndex >= 0) {
          completions.splice(existingIndex, 1)
        } else {
          completions.push(date)
        }

        return { ...habit, completions }
      }),
    )
  }

  const deleteHabit = (habitId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thói quen này?")) {
      setHabits(habits.filter((h) => h.id !== habitId))
    }
  }

  const getWeekDays = (weekStart: Date) => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }

  const getHabitStreak = (habit: Habit) => {
    if (habit.completions.length === 0) return 0

    const sortedCompletions = [...habit.completions].sort((a, b) => b.getTime() - a.getTime())
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i])
      completionDate.setHours(0, 0, 0, 0)

      if (isSameDay(completionDate, currentDate)) {
        streak++
        currentDate = addDays(currentDate, -1)
      } else if (completionDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    return streak
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = getWeekDays(weekStart)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🔥</span>
              Theo dõi thói quen
            </div>
            <Button onClick={() => setIsAddingHabit(true)} size="sm">
              <span className="mr-2">➕</span>
              Thêm thói quen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Habit */}
          {isAddingHabit && (
            <div className="flex gap-2">
              <Input
                placeholder="Tên thói quen mới..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                autoFocus
              />
              <Button onClick={addHabit}>Thêm</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingHabit(false)
                  setNewHabitName("")
                }}
              >
                Hủy
              </Button>
            </div>
          )}

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
              ← Tuần trước
            </Button>
            <h3 className="font-semibold">
              {format(weekStart, "dd/MM", { locale: vi })} -{" "}
              {format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: vi })}
            </h3>
            <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
              Tuần sau →
            </Button>
          </div>

          {/* Habits Grid */}
          {habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-4">🎯</span>
              <p>Chưa có thói quen nào. Hãy thêm thói quen đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-8 gap-2 text-sm font-medium text-muted-foreground">
                <div>Thói quen</div>
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center">
                    <div>{format(day, "EEE", { locale: vi })}</div>
                    <div className="text-xs">{format(day, "dd")}</div>
                  </div>
                ))}
              </div>

              {/* Habits */}
              {habits.map((habit) => {
                const streak = getHabitStreak(habit)
                return (
                  <div key={habit.id} className="grid grid-cols-8 gap-2 items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                      <div>
                        <div className="font-medium text-sm">{habit.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>🔥</span>
                          {streak} ngày
                        </div>
                      </div>
                    </div>

                    {weekDays.map((day, index) => {
                      const isCompleted = habit.completions.some((c) => isSameDay(c, day))
                      const isToday = isSameDay(day, new Date())
                      const isFuture = day > new Date()

                      return (
                        <div key={index} className="flex justify-center">
                          <button
                            onClick={() => !isFuture && toggleHabitCompletion(habit.id, day)}
                            disabled={isFuture}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCompleted
                                ? `${habit.color} border-transparent text-white`
                                : isToday
                                  ? "border-primary hover:bg-primary/10"
                                  : isFuture
                                    ? "border-muted-foreground/20 cursor-not-allowed"
                                    : "border-muted-foreground/40 hover:border-primary"
                            }`}
                          >
                            {isCompleted && <span>✅</span>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats */}
          {habits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{habits.length}</div>
                <div className="text-sm text-muted-foreground">Thói quen đang theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.max(...habits.map(getHabitStreak), 0)}</div>
                <div className="text-sm text-muted-foreground">Chuỗi dài nhất</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    habits.reduce((acc, habit) => {
                      const weekCompletions = weekDays.filter((day) =>
                        habit.completions.some((c) => isSameDay(c, day)),
                      ).length
                      return acc + (weekCompletions / 7) * 100
                    }, 0) / habits.length,
                  ) || 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Hoàn thành tuần này</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
