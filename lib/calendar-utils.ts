export const calendarUtils = {
  getDaysInMonth: (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  },

  getFirstDayOfMonth: (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
  },

  getMonthName: (month: number): string => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ]
    return months[month]
  },

  getDayName: (day: number): string => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    return days[day]
  },

  getFullDayName: (day: number): string => {
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    return days[day]
  },

  isSameDay: (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  },

  isToday: (date: Date): boolean => {
    return calendarUtils.isSameDay(date, new Date())
  },

  getWeekDates: (date: Date): Date[] => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek)
      weekDate.setDate(startOfWeek.getDate() + i)
      weekDates.push(weekDate)
    }
    return weekDates
  },

  getMonthDates: (year: number, month: number): Date[] => {
    const firstDay = calendarUtils.getFirstDayOfMonth(year, month)
    const daysInMonth = calendarUtils.getDaysInMonth(year, month)
    const daysInPrevMonth = calendarUtils.getDaysInMonth(year, month - 1)

    const dates = []

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      dates.push(date)
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      dates.push(date)
    }

    // Next month's leading days
    const remainingDays = 42 - dates.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      dates.push(date)
    }

    return dates
  },

  formatDateKey: (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  },

  getTasksForDate: (tasks: any[], date: Date): any[] => {
    return tasks.filter((task) => {
      if (!task.deadline) return false
      return calendarUtils.isSameDay(new Date(task.deadline), date)
    })
  },
}
