"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/socket-provider";
import { notifications } from "@mantine/notifications";

export function RealTimeTaskListener() {
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.on("TASK_UPDATE", (data: any) => {
      // Refresh the current page to get updated data
      router.refresh();

      notifications.show({
        title: "Task Updated",
        message: `Task status changed in real-time.`,
        color: "blue",
        autoClose: 2000,
      });
    });

    socket.on("WEEKLY_REPORT_GENERATED", (data: any) => {
      notifications.show({
        title: "Automated Report",
        message: data.message,
        color: "green",
      });
      router.refresh();
    });

    return () => {
      socket.off("TASK_UPDATE");
      socket.off("WEEKLY_REPORT_GENERATED");
    };
  }, [socket, router]);

  return null;
}
