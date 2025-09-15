"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/types"

interface PomodoroTimerProps {
  tasks: Task[]
  onTaskComplete?: (taskId: string) => void
}

export function PomodoroTimer({ tasks, onTaskComplete }: PomodoroTimerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Play notification sound (if available)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to browser notification
        if (Notification.permission === "granted") {
          new Notification(isBreak ? "Nghỉ giải lao kết thúc!" : "Pomodoro hoàn thành!", {
            body: isBreak ? "Hãy quay lại làm việc" : "Hãy nghỉ giải lao",
            icon: "/favicon.ico",
          })
        }
      })
    }

    if (!isBreak) {
      setPomodoroCount((prev) => prev + 1)
      setIsBreak(true)
      setTimeLeft(breakDuration * 60)

      // Mark task as completed if it was selected
      if (selectedTaskId && onTaskComplete) {
        onTaskComplete(selectedTaskId)
      }
    } else {
      setIsBreak(false)
      setTimeLeft(workDuration * 60)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(workDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = isBreak
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100

  const incompleteTasks = tasks.filter((task) => task.status !== "done" && task.status !== "cancelled")
  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Pomodoro Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Chọn nhiệm vụ để tập trung</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhiệm vụ..." />
              </SelectTrigger>
              <SelectContent>
                {incompleteTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title} (Ưu tiên {task.priority})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold mb-4 ${isBreak ? "text-green-600" : "text-primary"}`}>
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-2 justify-center mb-4">
              {isBreak ? (
                <>
                  <span>☕</span>
                  <span className="text-green-600 font-medium">Thời gian nghỉ</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span className="text-primary font-medium">Thời gian làm việc</span>
                </>
              )}
            </div>

            <Progress value={progress} className="mb-6" />

            {selectedTask && !isBreak && (
              <div className="bg-muted p-3 rounded-lg mb-4">
                <p className="font-medium">{selectedTask.title}</p>
                {selectedTask.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isRunning ? (
                  <>
                    <span className="mr-2">⏸️</span>
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶️</span>
                    Bắt đầu
                  </>
                )}
              </Button>

              <Button onClick={resetTimer} variant="outline" size="lg">
                <span className="mr-2">🔄</span>
                Đặt lại
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium">Thời gian làm việc (phút)</label>
              <Select
                value={workDuration.toString()}
                onValueChange={(value) => {
                  setWorkDuration(Number(value))
                  if (!isRunning && !isBreak) {
                    setTimeLeft(Number(value) * 60)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="25">25 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="45">45 phút</SelectItem>
                  <SelectItem value="60">60 phút</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Thời gian nghỉ (phút)</label>
              <Select value={breakDuration.toString()} onValueChange={(value) => setBreakDuration(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 phút</SelectItem>
                  <SelectItem value="10">10 phút</SelectItem>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="20">20 phút</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Pomodoro hoàn thành hôm nay: <span className="font-bold text-primary">{pomodoroCount}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for notifications */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
      />
    </div>
  )
}
