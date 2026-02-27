"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  Legend
} from "recharts"

interface MemberStat {
  id: string
  name: string
  report_count: string
  attendance_count: string
  completed_tasks: string
}

interface DailyReport {
  report_date: string
  count: string
}

interface TaskStat {
  status: string
  count: string
}

interface TeamAnalyticsChartsProps {
  analytics: {
    memberStats: MemberStat[]
    dailyReports: DailyReport[]
    taskStats: TaskStat[]
  }
}

const TASK_COLORS = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
}

export function TeamAnalyticsCharts({ analytics }: TeamAnalyticsChartsProps) {
  const { memberStats, dailyReports, taskStats } = analytics

  const chartData = dailyReports.reverse().map((d) => ({
    date: new Date(d.report_date).toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short",
      day: "numeric"
    }),
    reports: Number(d.count),
  }))

  const pieData = taskStats.map((t) => ({
    name: t.status.charAt(0) + t.status.slice(1).toLowerCase().replace("_", " "),
    value: Number(t.count),
    color: TASK_COLORS[t.status as keyof typeof TASK_COLORS] || "#94a3b8",
  }))

  const totalTasks = pieData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Reports Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Reports (Last 7 Days)</CardTitle>
            <CardDescription>Number of reports submitted per day</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar 
                    dataKey="reports" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Current status of all team tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {totalTasks === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No tasks assigned
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Member Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Activity (Last 30 Days)</CardTitle>
          <CardDescription>Reports, attendance, and completed tasks per member</CardDescription>
        </CardHeader>
        <CardContent>
          {memberStats.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="space-y-6">
              {memberStats.map((member) => (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.report_count} reports, {member.attendance_count} days, {member.completed_tasks} tasks
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Reports</span>
                        <span>{member.report_count}/30</span>
                      </div>
                      <Progress value={(Number(member.report_count) / 30) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span>{member.attendance_count}/30</span>
                      </div>
                      <Progress value={(Number(member.attendance_count) / 30) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Tasks Done</span>
                        <span>{member.completed_tasks}</span>
                      </div>
                      <Progress value={Math.min(Number(member.completed_tasks) * 10, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
