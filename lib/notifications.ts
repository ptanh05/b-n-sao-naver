export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = "default"

  private constructor() {
    if (typeof window !== "undefined") {
      this.permission = Notification.permission
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied"
    }

    if (this.permission === "default") {
      this.permission = await Notification.requestPermission()
    }

    return this.permission
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return
    }

    if (this.permission !== "granted") {
      const permission = await this.requestPermission()
      if (permission !== "granted") {
        console.warn("Notification permission not granted")
        return
      }
    }

    const notificationOptions: NotificationOptions = {
      icon: options.icon || "/favicon.ico",
      badge: options.badge || "/favicon.ico",
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      vibrate: options.vibrate || [200, 100, 200],
      ...options,
    }

    new Notification(options.title, notificationOptions)
  }

  async showTaskReminder(taskTitle: string, deadline: Date): Promise<void> {
    const now = new Date()
    const timeUntilDeadline = deadline.getTime() - now.getTime()
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

    let urgency = "low"
    let body = `Nhiệm vụ "${taskTitle}" sẽ đến hạn vào ${deadline.toLocaleString("vi-VN")}`

    if (hoursUntilDeadline < 1) {
      urgency = "urgent"
      body = `Nhiệm vụ "${taskTitle}" sẽ đến hạn trong ${Math.round(timeUntilDeadline / (1000 * 60))} phút!`
    } else if (hoursUntilDeadline < 24) {
      urgency = "medium"
      body = `Nhiệm vụ "${taskTitle}" sẽ đến hạn trong ${Math.round(hoursUntilDeadline)} giờ`
    }

    await this.showNotification({
      title: urgency === "urgent" ? "⚠️ Deadline sắp đến!" : "📅 Nhắc nhở nhiệm vụ",
      body,
      tag: `task-${taskTitle}`,
      requireInteraction: urgency === "urgent",
      vibrate: urgency === "urgent" ? [300, 200, 300, 200, 300] : [200, 100, 200],
    })
  }

  async showPomodoroComplete(isBreak: boolean): Promise<void> {
    await this.showNotification({
      title: isBreak ? "☕ Nghỉ giải lao kết thúc!" : "🎯 Pomodoro hoàn thành!",
      body: isBreak ? "Hãy quay lại làm việc" : "Hãy nghỉ giải lao",
      tag: "pomodoro",
      vibrate: [200, 100, 200],
    })
  }

  async showHabitReminder(habitName: string): Promise<void> {
    await this.showNotification({
      title: "🔥 Nhắc nhở thói quen",
      body: `Đã đến lúc thực hiện thói quen "${habitName}"!`,
      tag: `habit-${habitName}`,
      vibrate: [200, 100, 200],
    })
  }

  async showTaskCompleted(taskTitle: string): Promise<void> {
    await this.showNotification({
      title: "✅ Nhiệm vụ hoàn thành!",
      body: `Bạn đã hoàn thành nhiệm vụ "${taskTitle}"`,
      tag: `task-completed-${taskTitle}`,
      vibrate: [100, 50, 100],
    })
  }
}

export const notificationService = NotificationService.getInstance()

