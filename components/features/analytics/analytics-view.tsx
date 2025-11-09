"use client"

import type { Task } from "@/lib/types"
import { analyticsUtils } from "@/lib/analytics-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Clock, Target, CheckCircle, AlertTriangle, Calendar, Zap } from "lucide-react"
import { useMemo } from "react"

interface AnalyticsViewProps {
  tasks: Task[]
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const analytics = useMemo(() => analyticsUtils.calculateAnalytics(tasks), [tasks])

  const COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#6b7280"]

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          Chưa có dữ liệu để phân tích. Hãy tạo và hoàn thành một số nhiệm vụ để xem thống kê!
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tổng nhiệm vụ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.pendingTasks}</div>
                <div className="text-sm text-muted-foreground">Đang chờ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.overdueTasks}</div>
                <div className="text-sm text-muted-foreground">Quá hạn</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tỷ lệ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</span>
                <Badge variant={analytics.completionRate >= 70 ? "default" : "secondary"}>
                  {analytics.completionRate >= 70 ? "Tốt" : "Cần cải thiện"}
                </Badge>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {analytics.completedTasks} trong tổng số {analytics.totalTasks} nhiệm vụ
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Thời gian trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold">
                {analyticsUtils.formatMinutes(Math.round(analytics.averageCompletionTime))}
              </div>
              <p className="text-sm text-muted-foreground">Thời gian trung bình để hoàn thành một nhiệm vụ</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Chuỗi năng suất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{analytics.productivityStreak}</span>
                <span className="text-muted-foreground">ngày</span>
              </div>
              <p className="text-sm text-muted-foreground">Số ngày liên tiếp hoàn thành nhiệm vụ</p>
              {analytics.productivityStreak >= 7 && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">🔥 Streak tuyệt vời!</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.tasksByStatus.filter((item) => item.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo độ ưu tiên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" tickFormatter={(value) => `P${value}`} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Ưu tiên ${value}`} formatter={(value) => [value, "Số lượng"]} />
                  <Bar dataKey="count" fill="#15803d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Năng suất 7 ngày qua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Hoàn thành" />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Tạo mới" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Năng suất theo tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
                  <Bar dataKey="created" fill="#3b82f6" name="Tạo mới" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Spent Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Thời gian theo độ ưu tiên</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.timeSpentByPriority
              .filter((item) => item.totalMinutes > 0)
              .sort((a, b) => b.totalMinutes - a.totalMinutes)
              .map((item) => (
                <div key={item.priority} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Ưu tiên {item.priority}</Badge>
                    <span className="font-medium">{analyticsUtils.getPriorityLabel(item.priority)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{analyticsUtils.formatMinutes(item.totalMinutes)}</div>
                    <div className="text-sm text-muted-foreground">
                      {(
                        (item.totalMinutes /
                          analytics.timeSpentByPriority.reduce((sum, p) => sum + p.totalMinutes, 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Nhận xét và gợi ý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.completionRate >= 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Hiệu suất xuất sắc!</div>
                  <div className="text-sm text-green-700">
                    Bạn đang duy trì tỷ lệ hoàn thành cao. Hãy tiếp tục phát huy!
                  </div>
                </div>
              </div>
            )}

            {analytics.overdueTasks > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Cần chú ý!</div>
                  <div className="text-sm text-red-700">
                    Bạn có {analytics.overdueTasks} nhiệm vụ quá hạn. Hãy ưu tiên hoàn thành chúng.
                  </div>
                </div>
              </div>
            )}

            {analytics.productivityStreak >= 7 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-800">Chuỗi năng suất tuyệt vời!</div>
                  <div className="text-sm text-amber-700">
                    Bạn đã duy trì {analytics.productivityStreak} ngày liên tiếp hoàn thành nhiệm vụ.
                  </div>
                </div>
              </div>
            )}

            {analytics.completionRate < 50 && analytics.totalTasks > 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Gợi ý cải thiện</div>
                  <div className="text-sm text-blue-700">
                    Hãy thử chia nhỏ các nhiệm vụ lớn và đặt deadline thực tế hơn để tăng tỷ lệ hoàn thành.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

