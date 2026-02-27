"use client";

import { useEffect } from "react";
import { heartbeat } from "@/app/actions/presence";

export function PresenceHeartbeat({ userId }: { userId: string }) {
  useEffect(() => {
    // Send initial heartbeat
    heartbeat(userId);

    // Send heartbeat every 4 minutes (server considers offline after 5 mins)
    const interval = setInterval(
      () => {
        heartbeat(userId);
      },
      4 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [userId]);

  return null;
}
