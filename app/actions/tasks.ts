"use server";

import { db } from "@/lib/db";
import { tasks, subTasks, dailyReports } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { broadcastEvent } from "@/lib/socket-utils";

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

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(taskId: string, status: string) {
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
      updateDate: new Date(),
    })
    .where(eq(tasks.id, taskId));

  await broadcastEvent("TASK_UPDATE", { taskId, status: schemaStatus });

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  // Delete subtasks first (though foreign key might handle it, explicitly is safer)
  await db.delete(subTasks).where(eq(subTasks.taskId, taskId));
  await db.delete(tasks).where(eq(tasks.id, taskId));

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}

export async function createSubTask({
  taskId,
  title,
  createdBy,
}: {
  taskId: string;
  title: string;
  createdBy: string;
}) {
  const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
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
    isDone: false,
    createdBy,
  });

  revalidatePath("/dashboard/tasks");
}

export async function updateSubTaskStatus(subTaskId: string, isDone: boolean) {
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
    .set({ isDone, updateDate: new Date() })
    .where(eq(subTasks.id, subTaskId));

  revalidatePath("/dashboard/tasks");
}

export async function deleteSubTask(subTaskId: string) {
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
}
