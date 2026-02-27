"use client";

import React from "react";
import { MantineColorScheme, MantineProvider } from "@mantine/core";
import { ThemeEffect } from "@/components/theme/theme-effect";
import { useMantineTheme } from "@/hooks/use-mantine-theme";
import { ThemeProvider } from "../theme-provider";

import { useTheme } from "next-themes";
import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";

function ThemeSync() {
  const { theme } = useTheme();
  console.log(theme);
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    setColorScheme((theme || "auto") as MantineColorScheme);
  }, [theme]);

  return null;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="oms-theme"
    >
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <ThemeSync />
        <ThemeEffect />
        {children}
      </MantineProvider>
    </ThemeProvider>
  );
}
