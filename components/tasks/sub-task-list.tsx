"use client";

import { useState } from "react";
import {
  Checkbox,
  ActionIcon,
  Group,
  TextInput,
  Stack,
  Text,
} from "@mantine/core";
import { Trash, Plus } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

import {
  createSubTask,
  updateSubTaskStatus,
  deleteSubTask,
} from "@/app/actions/tasks";

interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
  dueDate?: string | null;
  completedAt?: Date | string | null;
  creationDate: Date | string;
}

interface SubTaskListProps {
  taskId: string;
  subTasks: SubTask[];
  userId: string;
  isLocked?: boolean;
}

export function SubTaskList({
  taskId,
  subTasks: initialSubTasks,
  userId,
  isLocked,
}: SubTaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setLoading("add");
    try {
      await createSubTask({
        taskId,
        title: newTitle,
        dueDate: newDueDate || undefined,
        createdBy: userId,
      });
      setNewTitle("");
      setNewDueDate("");
    } finally {
      setLoading(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    try {
      await updateSubTaskStatus(id, !currentStatus);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      await deleteSubTask(id);
    } finally {
      setLoading(null);
    }
  };

  const calculateSLA = (st: SubTask) => {
    if (!st.completedAt) return null;
    const start = dayjs(st.creationDate);
    const end = dayjs(st.completedAt);
    const diff = end.diff(start);

    if (diff < 0) return "Recently";

    const dur = dayjs.duration(diff);

    if (dur.asMinutes() < 1) {
      const secs = Math.floor(dur.asSeconds());
      return secs <= 5 ? "Just now" : `${secs}s`;
    }

    if (dur.asHours() < 1) {
      return `${Math.floor(dur.asMinutes())}m`;
    }

    const hours = Math.floor(dur.asHours());
    const mins = dur.minutes();
    return `${hours}h ${mins}m`;
  };

  const calculateDelay = (st: SubTask) => {
    if (!st.dueDate) return null;
    const deadline = dayjs(st.dueDate).endOf("day");
    const completion = st.completedAt ? dayjs(st.completedAt) : dayjs();

    if (completion.isAfter(deadline)) {
      const diff = completion.diff(deadline);
      const dur = dayjs.duration(diff);

      if (dur.asDays() >= 1) {
        return `${Math.floor(dur.asDays())}d ${dur.hours()}h overdue`;
      }
      if (dur.asHours() >= 1) {
        return `${Math.floor(dur.asHours())}h ${dur.minutes()}m overdue`;
      }
      return `${Math.floor(dur.asMinutes())}m overdue`;
    }
    return null;
  };

  return (
    <Stack gap="xs" mt="sm">
      <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-widest">
        Sub-tasks & Performance (SLA)
      </Text>

      {initialSubTasks.map((st) => {
        const sla = calculateSLA(st);
        const delay = calculateDelay(st);
        const isOverdue =
          st.dueDate &&
          !st.isDone &&
          dayjs().isAfter(dayjs(st.dueDate).endOf("day"));

        return (
          <Group key={st.id} gap="sm" wrap="nowrap" align="center">
            <Checkbox
              checked={st.isDone}
              onChange={() => handleToggle(st.id, st.isDone)}
              disabled={loading === st.id || isLocked}
              size="xs"
            />
            <div style={{ flex: 1 }}>
              <Text
                size="sm"
                style={{
                  textDecoration: st.isDone ? "line-through" : "none",
                }}
              >
                {st.title}
              </Text>
              <Group gap={8}>
                {st.dueDate && (
                  <Text
                    size="10px"
                    c={isOverdue ? "red.6" : "dimmed"}
                    fw={isOverdue ? 700 : 400}
                  >
                    Deadline: {new Date(st.dueDate).toLocaleDateString()}
                  </Text>
                )}
                {sla && (
                  <Text size="10px" c="brand.6" fw={600}>
                    SLA: {sla}
                  </Text>
                )}
                {delay && (
                  <Text size="10px" c="red.6" fw={700}>
                    Time Lost: {delay}
                  </Text>
                )}
              </Group>
            </div>
            {!isLocked && (
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDelete(st.id)}
                loading={loading === st.id}
                size="sm"
              >
                <Trash size={14} />
              </ActionIcon>
            )}
          </Group>
        );
      })}

      {!isLocked && (
        <Group gap="xs" mt="xs" align="center">
          <Stack gap={4} style={{ flex: 1 }}>
            <TextInput
              placeholder="Add sub-task..."
              size="xs"
              value={newTitle}
              onChange={(e) => setNewTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Group gap={6}>
              <Text size="10px" c="dimmed">
                Set Deadline:
              </Text>
              <input
                type="date"
                className="text-[10px] bg-transparent border border-gray-100 dark:border-white/10 rounded px-1 focus:outline-none dark:invert"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </Group>
          </Stack>
          <ActionIcon
            variant="filled"
            color="brand"
            onClick={handleAdd}
            loading={loading === "add"}
            size="sm"
          >
            <Plus size={14} />
          </ActionIcon>
        </Group>
      )}
    </Stack>
  );
}
