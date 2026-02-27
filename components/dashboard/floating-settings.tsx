"use client";

import { useState } from "react";
import { ActionIcon, Tooltip, Transition } from "@mantine/core";
import { Settings } from "lucide-react";
import { PreferencesDrawer } from "./preferences-drawer";

interface FloatingSettingsProps {
  userSettings?: any;
}

export function FloatingSettings({ userSettings }: FloatingSettingsProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div className="fixed bottom-50 right-2 z-999999">
        <Tooltip label="System Preferences" position="left" withArrow>
          <button
            onClick={() => setOpened(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Spinning Icon */}
            <Settings
              size={24}
              className="text-gray-700 dark:text-gray-200 group-hover:text-brand-500 group-hover:rotate-90 transition-all duration-500"
            />

            {/* Subtle Pulse */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </button>
        </Tooltip>
      </div>

      <PreferencesDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        userSettings={userSettings}
      />
    </>
  );
}
