import type { Task } from "./types"

export async function exportToPDF(tasks: Task[]): Promise<void> {
  // For now, we'll use a simple approach with window.print()
  // In production, you'd use a library like jsPDF or pdfmake
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tasks Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #15803d; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #15803d; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Danh sách nhiệm vụ</h1>
        <p>Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</p>
        <p>Tổng số: ${tasks.length} nhiệm vụ</p>
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Ưu tiên</th>
              <th>Hạn chót</th>
              <th>Thời gian ước tính</th>
            </tr>
          </thead>
          <tbody>
            ${tasks
              .map(
                (task) => `
              <tr>
                <td>${task.title}</td>
                <td>${task.description || ""}</td>
                <td>${
                  task.status === "todo"
                    ? "Chưa làm"
                    : task.status === "in_progress"
                    ? "Đang làm"
                    : task.status === "done"
                    ? "Hoàn thành"
                    : "Đã hủy"
                }</td>
                <td>${task.priority}</td>
                <td>${task.deadline ? new Date(task.deadline).toLocaleDateString("vi-VN") : ""}</td>
                <td>${task.estimatedMinutes ? `${task.estimatedMinutes} phút` : ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

export function exportToCSV(tasks: Task[]): string {
  const headers = ["Tiêu đề", "Mô tả", "Trạng thái", "Ưu tiên", "Hạn chót", "Thời gian ước tính", "Tags", "Danh mục"]
  
  const rows = tasks.map((task) => {
    const status =
      task.status === "todo"
        ? "Chưa làm"
        : task.status === "in_progress"
        ? "Đang làm"
        : task.status === "done"
        ? "Hoàn thành"
        : "Đã hủy"
    
    return [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || "").replace(/"/g, '""')}"`,
      status,
      task.priority.toString(),
      task.deadline ? new Date(task.deadline).toISOString() : "",
      task.estimatedMinutes?.toString() || "",
      `"${(task.tags || []).join(", ").replace(/"/g, '""')}"`,
      task.category || "",
    ]
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  return csvContent
}

export function importFromCSV(csvContent: string): Partial<Task>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const tasks: Partial<Task>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const task: Partial<Task> = {
      title: values[0]?.replace(/^"|"$/g, "") || "",
      description: values[1]?.replace(/^"|"$/g, "") || undefined,
      status:
        values[2] === "Chưa làm"
          ? "todo"
          : values[2] === "Đang làm"
          ? "in_progress"
          : values[2] === "Hoàn thành"
          ? "done"
          : values[2] === "Đã hủy"
          ? "cancelled"
          : "todo",
      priority: (Number.parseInt(values[3]) || 3) as 1 | 2 | 3 | 4 | 5,
      deadline: values[4] ? new Date(values[4]) : undefined,
      estimatedMinutes: values[5] ? Number.parseInt(values[5]) : undefined,
      tags: values[6] ? values[6].replace(/^"|"$/g, "").split(", ").filter((t) => t.trim()) : undefined,
      category: values[7]?.replace(/^"|"$/g, "") || undefined,
    }

    if (task.title) {
      tasks.push(task)
    }
  }

  return tasks
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

