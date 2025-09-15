import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/lib/types"
import {
  calculateCompletionRate,
  calculateProductivityStreak,
  getOverdueTasks,
  calculateAverageCompletionTime,
  getTasksByPriority,
} from "@/lib/analytics-utils"

interface ProductivityInsightsProps {
  tasks: Task[]
}

export function ProductivityInsights({ tasks }: ProductivityInsightsProps) {
  const completionRate = calculateCompletionRate(tasks)
  const streak = calculateProductivityStreak(tasks)
  const overdueTasks = getOverdueTasks(tasks)
  const avgCompletionTime = calculateAverageCompletionTime(tasks)
  const priorityDistribution = getTasksByPriority(tasks)

  const getInsights = () => {
    const insights = []

    if (completionRate >= 80) {
      insights.push({
        type: "success",
        icon: "✅",
        title: "Hiệu suất xuất sắc!",
        description: `Bạn đã hoàn thành ${completionRate.toFixed(1)}% nhiệm vụ. Tiếp tục duy trì!`,
        action: "Hãy thử thách bản thân với nhiệm vụ khó hơn.",
      })
    } else if (completionRate < 50) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Cần cải thiện hiệu suất",
        description: `Tỷ lệ hoàn thành chỉ ${completionRate.toFixed(1)}%. Hãy xem xét lại kế hoạch.`,
        action: "Thử chia nhỏ nhiệm vụ lớn thành các bước nhỏ hơn.",
      })
    }

    if (streak >= 7) {
      insights.push({
        type: "success",
        icon: "📈",
        title: "Chuỗi thành công ấn tượng!",
        description: `Bạn đã duy trì ${streak} ngày làm việc hiệu quả liên tiếp.`,
        action: "Hãy thưởng cho bản thân và tiếp tục duy trì!",
      })
    } else if (streak === 0) {
      insights.push({
        type: "info",
        icon: "🎯",
        title: "Bắt đầu chuỗi mới",
        description: "Hãy hoàn thành ít nhất 1 nhiệm vụ hôm nay để bắt đầu chuỗi thành công.",
        action: "Chọn 1 nhiệm vụ dễ để tạo động lực.",
      })
    }

    if (overdueTasks.length > 0) {
      insights.push({
        type: "error",
        icon: "⚠️",
        title: "Có nhiệm vụ quá hạn",
        description: `${overdueTasks.length} nhiệm vụ đã quá deadline.`,
        action: "Ưu tiên hoàn thành các nhiệm vụ quá hạn trước.",
      })
    }

    const highPriorityIncomplete = priorityDistribution.filter((p) => p.priority >= 4 && p.completed < p.total)

    if (highPriorityIncomplete.length > 0) {
      insights.push({
        type: "warning",
        icon: "📈",
        title: "Tập trung vào ưu tiên cao",
        description: "Bạn có nhiệm vụ ưu tiên cao chưa hoàn thành.",
        action: "Dành 2-3 giờ đầu ngày cho nhiệm vụ quan trọng nhất.",
      })
    }

    return insights
  }

  const insights = getInsights()

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-amber-200 bg-amber-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chuỗi thành công</p>
                <p className="text-2xl font-bold">{streak} ngày</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Phân tích & Đề xuất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <p className="text-sm font-medium">{insight.action}</p>
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-4">⏰</span>
                <p>Chưa có đủ dữ liệu để phân tích. Hãy thêm và hoàn thành một số nhiệm vụ!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ theo độ ưu tiên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityDistribution.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={item.priority >= 4 ? "destructive" : item.priority >= 3 ? "default" : "secondary"}>
                    Ưu tiên {item.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.completed}/{item.total} hoàn thành
                  </span>
                </div>
                <Progress value={item.total > 0 ? (item.completed / item.total) * 100 : 0} className="w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
