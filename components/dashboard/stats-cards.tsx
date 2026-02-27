import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    tasks: {
      completed: number;
      inProgress: number;
      pending: number;
    };
    reportsThisMonth: number;
    attendanceThisMonth: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const totalTasks =
    stats.tasks.completed + stats.tasks.inProgress + stats.tasks.pending;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="premium-card group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Completed Tasks
          </CardTitle>
          <div className="p-2 rounded-lg bg-success-500/10 border border-success-500/20 group-hover:bg-success-500/20 transition-all shadow-sm shadow-success-500/5">
            <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {stats.tasks.completed}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-1">
            of{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {totalTasks}
            </span>{" "}
            assigned
          </p>
        </CardContent>
      </Card>

      <Card className="premium-card group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Active Tasks
          </CardTitle>
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500/20 transition-all shadow-sm shadow-brand-500/5">
            <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {stats.tasks.inProgress}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-1">
            Currently in progress
          </p>
        </CardContent>
      </Card>

      <Card className="premium-card group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Monthly Reports
          </CardTitle>
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all shadow-sm shadow-indigo-500/5">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {stats.reportsThisMonth}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-1">
            Submitted in{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {new Date().toLocaleString("default", { month: "short" })}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="premium-card group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            Attendance
          </CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all shadow-sm shadow-amber-500/5">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {stats.attendanceThisMonth}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-1">
            Days active this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
