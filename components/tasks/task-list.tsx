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
} from "lucide-react";
import { updateTaskStatus } from "@/app/actions/tasks";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@mantine/core";
import { SubTaskList } from "./sub-task-list";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  creationDate: string;
  created_by_name: string | null;
  subTasks: any[];
}

interface TaskListProps {
  tasks: Task[];
  userId: string;
  totalPages: number;
  currentPage: number;
}

export function TaskList({
  tasks,
  userId,
  totalPages,
  currentPage,
}: TaskListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
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

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingTasks.length})
        </TabsTrigger>
        <TabsTrigger value="in_progress">
          In Progress ({inProgressTasks.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedTasks.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-3">
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

      <TabsContent value="pending" className="space-y-3">
        {pendingTasks.length === 0 ? (
          <EmptyState message="No pending tasks" />
        ) : (
          pendingTasks.map((task) => (
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

      <TabsContent value="in_progress" className="space-y-3">
        {inProgressTasks.length === 0 ? (
          <EmptyState message="No tasks in progress" />
        ) : (
          inProgressTasks.map((task) => (
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

      <TabsContent value="completed" className="space-y-3">
        {completedTasks.length === 0 ? (
          <EmptyState message="No completed tasks" />
        ) : (
          completedTasks.map((task) => (
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={handlePageChange}
            color="brand"
            size="sm"
            radius="xl"
          />
        </div>
      )}
    </Tabs>
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
    new Date(task.due_date) < new Date();

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
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
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
