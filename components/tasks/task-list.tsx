"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
} from "lucide-react";
import { updateTaskStatus } from "@/app/actions/tasks";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SubTaskList } from "./sub-task-list";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { ServerPagination } from "../ui/server-pagination";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  creationDate: string;
  created_by_name: string | null;
  subTasks: any[];
  isLocked?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  userId: string;
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export function TaskList({
  tasks,
  userId,
  totalPages,
  currentPage,
  totalCount,
}: TaskListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") || "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setIsUpdating(taskId);
    try {
      await updateTaskStatus(taskId, newStatus);
      router.refresh();
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeStatus} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 border-b-2 border-transparent rounded-none px-1 pb-2 bg-transparent"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger
            value="PENDING"
            className="data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 border-b-2 border-transparent rounded-none px-1 pb-2 bg-transparent"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="IN_PROGRESS"
            className="data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 border-b-2 border-transparent rounded-none px-1 pb-2 bg-transparent"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="COMPLETED"
            className="data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 border-b-2 border-transparent rounded-none px-1 pb-2 bg-transparent"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeStatus} className="space-y-3 mt-4">
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userId={userId}
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating === task.id}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <ServerPagination
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={10}
          totalRecords={totalCount}
        />
      </div>
    </div>
  );
}

function TaskCard({
  task,
  userId,
  onStatusChange,
  isUpdating,
}: {
  task: Task;
  userId: string;
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20 hover:bg-success-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500/20">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-transparent"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue =
    task.due_date &&
    task.status !== "COMPLETED" &&
    dayjs().isAfter(dayjs(task.due_date).endOf("day"));

  return (
    <Card className={cn("premium-card", isOverdue && "border-error-500/50")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {task.title}
              </h3>
              {getStatusBadge(task.status)}
              {task.isLocked && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 bg-gray-100 dark:bg-white/5"
                >
                  <Lock size={10} className="mr-1" />
                  Submitted
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px] h-5">
                  Overdue
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {task.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due: {formatDate(task.due_date)}
                </span>
              )}
              {task.created_by_name && (
                <span>Assigned by: {task.created_by_name}</span>
              )}
            </div>
            <SubTaskList
              taskId={task.id}
              subTasks={task.subTasks}
              userId={userId}
              isLocked={task.isLocked}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isUpdating || task.isLocked}
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Task actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "PENDING" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "PENDING")}
                >
                  Mark as Pending
                </DropdownMenuItem>
              )}
              {task.status !== "IN_PROGRESS" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                >
                  Mark as In Progress
                </DropdownMenuItem>
              )}
              {task.status !== "COMPLETED" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "COMPLETED")}
                >
                  Mark as Completed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message = "No tasks found" }: { message?: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
