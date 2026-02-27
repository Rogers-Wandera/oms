import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Clock,
  UserCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface TeamOverviewProps {
  stats: {
    teamSize: number;
    todayReports: number;
    pendingReports: number;
    todayAttendance: number;
    dueToday?: number;
    overdue?: number;
  };
}

export function TeamOverview({ stats }: TeamOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="premium-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Presence</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.todayAttendance} / {stats.teamSize}
          </div>
          <p className="text-xs text-muted-foreground italic">
            Checked in today
          </p>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
          <FileText className="h-4 w-4 text-brand-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.todayReports} / {stats.teamSize}
          </div>
          <p className="text-xs text-muted-foreground italic">
            Submitted today
          </p>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingReports}</div>
          <p className="text-xs text-muted-foreground italic">
            Reports awaiting feedback
          </p>
        </CardContent>
      </Card>

      {stats.dueToday !== undefined && (
        <Card className="premium-card border-amber-500/20 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Due Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {stats.dueToday}
            </div>
            <p className="text-xs text-amber-600/80 italic">
              Tasks must be done today
            </p>
          </CardContent>
        </Card>
      )}

      {stats.overdue !== undefined && (
        <Card className="premium-card border-red-500/20 bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Overdue Tasks
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.overdue}
            </div>
            <p className="text-xs text-red-600/80 italic">
              Critical: Past deadline
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="premium-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.teamSize}</div>
          <p className="text-xs text-muted-foreground italic">
            Active team members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
