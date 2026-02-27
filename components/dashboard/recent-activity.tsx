import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, FileText, Clock } from "lucide-react";

interface Activity {
  type: string;
  title: string;
  status: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getStatusBadge = (type: string, status: string) => {
    if (type === "task") {
      switch (status) {
        case "COMPLETED":
          return (
            <Badge className="bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400">
              Completed
            </Badge>
          );
        case "IN_PROGRESS":
          return (
            <Badge className="bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-400">
              In Progress
            </Badge>
          );
        default:
          return <Badge variant="secondary">Pending</Badge>;
      }
    }
    // Report status
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-success-100 text-success-800 dark:bg-success-500/20 dark:text-success-400">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-error-100 text-error-800 dark:bg-error-500/20 dark:text-error-400">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="premium-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl tracking-tight text-gray-900 dark:text-white">
          Recent Activity
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Your latest project contributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
            <Clock className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-sm">No recent activity detected</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/3 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/5"
              >
                <div className="shrink-0 p-2 rounded-lg bg-brand-50 dark:bg-white/3 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  {activity.type === "task" ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
                      {activity.title}
                    </p>
                    <div className="shrink-0 ml-2">
                      {getStatusBadge(activity.type, activity.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium tracking-wide">
                    {formatTime(activity.timestamp)}
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    {activity.type === "task"
                      ? "Task Update"
                      : "Report Submission"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
