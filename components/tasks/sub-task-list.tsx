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
import {
  createSubTask,
  updateSubTaskStatus,
  deleteSubTask,
} from "@/app/actions/tasks";

interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
}

interface SubTaskListProps {
  taskId: string;
  subTasks: SubTask[];
  userId: string;
}

export function SubTaskList({
  taskId,
  subTasks: initialSubTasks,
  userId,
}: SubTaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setLoading("add");
    try {
      await createSubTask({ taskId, title: newTitle, createdBy: userId });
      setNewTitle("");
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

  return (
    <Stack gap="xs" mt="sm">
      <Text size="sm" fw={500} c="dimmed">
        Sub-tasks
      </Text>

      {initialSubTasks.map((st) => (
        <Group key={st.id} gap="sm" wrap="nowrap">
          <Checkbox
            checked={st.isDone}
            onChange={() => handleToggle(st.id, st.isDone)}
            disabled={loading === st.id}
          />
          <Text
            size="sm"
            style={{
              textDecoration: st.isDone ? "line-through" : "none",
              flex: 1,
            }}
          >
            {st.title}
          </Text>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(st.id)}
            loading={loading === st.id}
          >
            <Trash size={14} />
          </ActionIcon>
        </Group>
      ))}

      <Group gap="xs" mt="xs">
        <TextInput
          placeholder="Add sub-task..."
          size="xs"
          style={{ flex: 1 }}
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <ActionIcon
          variant="filled"
          color="brand"
          onClick={handleAdd}
          loading={loading === "add"}
        >
          <Plus size={14} />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
