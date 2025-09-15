"use client"

import type React from "react"

import { useState } from "react"
import type { Task, ViewMode } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { useAuth } from "@/hooks/use-auth"
import { TaskCard } from "./task-card"
import { TaskModal } from "./task-modal"
import { CalendarView } from "./calendar-view"
import { AnalyticsView } from "./analytics-view"
import { SyncManager } from "./sync-manager"
import { ScheduleOptimizer } from "./schedule-optimizer"
import { ProductivityInsights } from "./productivity-insights"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function TaskManager() {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getUpcomingTasks,
    exportTasks,
    importTasks,
  } = useTasks()

  const { user, logout } = useAuth()

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<number | "all">("all")
  const [showSyncManager, setShowSyncManager] = useState(false)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleCreateTask = (taskData: any) => {
    createTask(taskData)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleUpdateTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTask(undefined)
    }
  }

  const handleDeleteTask = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) {
      deleteTask(id)
    }
  }

  const handleStatusChange = (id: string, status: Task["status"]) => {
    updateTask(id, { status })
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setIsModalOpen(true)
    // Pre-fill the deadline with the clicked date
    setEditingTask(undefined)
  }

  const handleExport = () => {
    const data = exportTasks()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const success = importTasks(jsonData)
        if (success) {
          alert("Import thành công!")
        } else {
          alert("Import thất bại. Vui lòng kiểm tra định dạng file.")
        }
      } catch (error) {
        alert("Import thất bại. Vui lòng kiểm tra định dạng file.")
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const handleScheduleTask = (taskId: string, scheduledAt: Date) => {
    updateTask(taskId, { scheduledAt })
  }

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout()
    }
  }

  const upcomingTasks = getUpcomingTasks()
  const todoTasks = getTasksByStatus("todo")
  const inProgressTasks = getTasksByStatus("in_progress")
  const doneTasks = getTasksByStatus("done")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Show sync manager if requested
  if (showSyncManager) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowSyncManager(false)} className="mb-4">
            ← Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý đồng bộ</h1>
          <p className="text-muted-foreground">Sao lưu và khôi phục dữ liệu nhiệm vụ của bạn</p>
        </div>

        <SyncManager onExport={exportTasks} onImport={importTasks} taskCount={tasks.length} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý thời gian</h1>
            <p className="text-muted-foreground">Tổ chức và theo dõi các nhiệm vụ của bạn một cách hiệu quả</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Xin chào, {user?.fullName}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSyncManager(true)} className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                Đồng bộ
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
                <span className="text-sm">🚪</span>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary">{todoTasks.length}</div>
          <div className="text-sm text-muted-foreground">Chưa làm</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
          <div className="text-sm text-muted-foreground">Đang làm</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
          <div className="text-sm text-muted-foreground">Hoàn thành</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-amber-600">{upcomingTasks.length}</div>
          <div className="text-sm text-muted-foreground">Sắp đến hạn</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
            <Input
              placeholder="Tìm kiếm nhiệm vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="todo">Chưa làm</SelectItem>
              <SelectItem value="in_progress">Đang làm</SelectItem>
              <SelectItem value="done">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter.toString()}
            onValueChange={(value: any) => setPriorityFilter(value === "all" ? "all" : Number.parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ưu tiên</SelectItem>
              <SelectItem value="5">Cao nhất (5)</SelectItem>
              <SelectItem value="4">Cao (4)</SelectItem>
              <SelectItem value="3">Trung bình (3)</SelectItem>
              <SelectItem value="2">Thấp (2)</SelectItem>
              <SelectItem value="1">Thấp nhất (1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <span>➕</span>
            Tạo nhiệm vụ
          </Button>

          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 bg-transparent">
            <span>📥</span>
            Export
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <span>📤</span>
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setViewMode("list")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "list"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>📋</span>
          Danh sách
        </button>
        <button
          onClick={() => setViewMode("priority")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "priority"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>🎯</span>
          Ưu tiên
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "calendar"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>📅</span>
          Lịch
        </button>
        <button
          onClick={() => setViewMode("schedule")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "schedule"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>⏰</span>
          Lên lịch
        </button>
        <button
          onClick={() => setViewMode("insights")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "insights"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>📈</span>
          Phân tích
        </button>
        <button
          onClick={() => setViewMode("analytics")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap",
            viewMode === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <span>📊</span>
          Thống kê
        </button>
      </div>

      {/* Content */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc."
                  : "Chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ đầu tiên!"}
              </div>
              {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                  <span>➕</span>
                  Tạo nhiệm vụ đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks
                .sort((a, b) => {
                  // Sort by deadline first, then by priority
                  if (a.deadline && b.deadline) {
                    return a.deadline.getTime() - b.deadline.getTime()
                  }
                  if (a.deadline && !b.deadline) return -1
                  if (!a.deadline && b.deadline) return 1
                  return b.priority - a.priority
                })
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {viewMode === "priority" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[5, 4, 3, 2, 1].map((priority) => {
            const priorityTasks = filteredTasks.filter((task) => task.priority === priority)
            const priorityColors = {
              5: "border-red-200 bg-red-50",
              4: "border-orange-200 bg-orange-50",
              3: "border-yellow-200 bg-yellow-50",
              2: "border-blue-200 bg-blue-50",
              1: "border-gray-200 bg-gray-50",
            }

            return (
              <div
                key={priority}
                className={`rounded-lg border p-4 ${priorityColors[priority as keyof typeof priorityColors]}`}
              >
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                  Ưu tiên {priority}
                  <span className="text-sm bg-white px-2 py-1 rounded-full">{priorityTasks.length}</span>
                </h3>
                <div className="space-y-3">
                  {priorityTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            task.status === "done"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.status === "todo"
                            ? "Chưa làm"
                            : task.status === "in_progress"
                              ? "Đang làm"
                              : task.status === "done"
                                ? "Hoàn thành"
                                : "Đã hủy"}
                        </span>
                        {task.deadline && <span>{new Date(task.deadline).toLocaleDateString("vi-VN")}</span>}
                      </div>
                    </div>
                  ))}
                  {priorityTasks.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">Không có nhiệm vụ</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewMode === "calendar" && (
        <CalendarView tasks={filteredTasks} onTaskClick={handleTaskClick} onDateClick={handleDateClick} />
      )}

      {viewMode === "schedule" && <ScheduleOptimizer tasks={tasks} onScheduleTask={handleScheduleTask} />}

      {viewMode === "insights" && <ProductivityInsights tasks={tasks} />}

      {viewMode === "analytics" && <AnalyticsView tasks={tasks} />}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(undefined)
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  )
}
