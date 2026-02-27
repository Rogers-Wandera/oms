"use server";

import { db } from "@/lib/db";
import { tasks, subTasks, dailyReports, users } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { broadcastEvent } from "@/lib/socket-utils";
import { safeAction } from "@/lib/actions-utils";

async function isTaskLocked(taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });
  if (!task) return true;

  const report = await db.query.dailyReports.findFirst({
    where: and(
      eq(dailyReports.userId, task.assignedTo),
      eq(dailyReports.date, task.date),
      eq(dailyReports.status, "SUBMITTED"),
    ),
  });

  return !!report;
}

export async function createTask({
  title,
  description,
  dueDate,
  assignedTo,
  createdBy,
  initialSubTasks = [],
}: {
  title: string;
  description: string | null;
  dueDate: string | null;
  assignedTo: string;
  createdBy: string;
  initialSubTasks?: string[];
}) {
  return safeAction(async () => {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description,
        date: dueDate || new Date().toISOString().split("T")[0],
        assignedTo,
        createdBy,
        status: "PLANNED",
      })
      .returning();

    if (initialSubTasks.length > 0) {
      await db.insert(subTasks).values(
        initialSubTasks.map((t) => ({
          taskId: newTask.id,
          title: t,
          isDone: false,
          createdBy,
        })),
      );
    }

    // Trigger notification if assigned to someone else
    if (assignedTo !== createdBy) {
      const { createNotification } = await import("./notifications");
      const creator = await db.query.users.findFirst({
        where: eq(users.id, createdBy),
        columns: { firstName: true, lastName: true },
      });
      const creatorName = creator
        ? `${creator.firstName} ${creator.lastName}`
        : "Your supervisor";

      await createNotification({
        userId: assignedTo,
        title: "New Task Assigned",
        message: `${creatorName} has assigned you a new task: ${title}`,
        type: "TASK",
        link: "/dashboard/tasks",
      });
    }

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
  });
}

export async function updateTaskStatus(taskId: string, status: string) {
  return safeAction(async () => {
    let schemaStatus: "PLANNED" | "DONE" | "NOT_DONE" = "PLANNED";
    if (status === "COMPLETED" || status === "DONE") schemaStatus = "DONE";
    else if (status === "PENDING" || status === "NOT_DONE")
      schemaStatus = "NOT_DONE";
    else if (status === "IN_PROGRESS" || status === "PLANNED")
      schemaStatus = "PLANNED";

    if (await isTaskLocked(taskId)) {
      throw new Error(
        "Task is locked because a daily report has already been submitted for this day.",
      );
    }

    await db
      .update(tasks)
      .set({
        status: schemaStatus,
        completedAt: schemaStatus === "DONE" ? new Date() : null,
        updateDate: new Date(),
      })
      .where(eq(tasks.id, taskId));

    await broadcastEvent("TASK_UPDATE", { taskId, status: schemaStatus });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
  });
}

export async function deleteTask(taskId: string) {
  return safeAction(async () => {
    if (await isTaskLocked(taskId)) {
      throw new Error(
        "Task is locked because a daily report has already been submitted for this day.",
      );
    }
    // Delete subtasks first (though foreign key might handle it, explicitly is safer)
    await db.delete(subTasks).where(eq(subTasks.taskId, taskId));
    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
  });
}

export async function createSubTask({
  taskId,
  title,
  dueDate,
  createdBy,
}: {
  taskId: string;
  title: string;
  dueDate?: string;
  createdBy: string;
}) {
  return safeAction(async () => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });
    if (task?.status === "DONE") {
      throw new Error("Cannot add sub-tasks to a completed task.");
    }

    if (await isTaskLocked(taskId)) {
      throw new Error(
        "Task is locked because a daily report has already been submitted for this day.",
      );
    }

    await db.insert(subTasks).values({
      taskId,
      title,
      dueDate: dueDate || null,
      isDone: false,
      createdBy,
    });

    revalidatePath("/dashboard/tasks");
  });
}

export async function updateSubTaskStatus(subTaskId: string, isDone: boolean) {
  return safeAction(async () => {
    const subTask = await db.query.subTasks.findFirst({
      where: eq(subTasks.id, subTaskId),
    });
    if (subTask && (await isTaskLocked(subTask.taskId))) {
      throw new Error(
        "Sub-task is locked because a daily report has already been submitted for this day.",
      );
    }

    await db
      .update(subTasks)
      .set({
        isDone,
        completedAt: isDone ? new Date() : null,
        updateDate: new Date(),
      })
      .where(eq(subTasks.id, subTaskId));

    revalidatePath("/dashboard/tasks");
  });
}

export async function deleteSubTask(subTaskId: string) {
  return safeAction(async () => {
    const subTask = await db.query.subTasks.findFirst({
      where: eq(subTasks.id, subTaskId),
    });
    if (subTask && (await isTaskLocked(subTask.taskId))) {
      throw new Error(
        "Sub-task is locked because a daily report has already been submitted for this day.",
      );
    }

    await db.delete(subTasks).where(eq(subTasks.id, subTaskId));
    revalidatePath("/dashboard/tasks");
  });
}
