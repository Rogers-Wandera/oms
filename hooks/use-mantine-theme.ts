"use client";

import { useMemo } from "react";
import { createTheme } from "@mantine/core";
import { useSettings } from "@/hooks/use-settings";

export function useMantineTheme() {
  const { fontFamily, colorScheme } = useSettings();

  const theme = useMemo(() => {
    return createTheme({
      fontFamily: `var(--font-${fontFamily}), sans-serif`,
      primaryColor: "brand",
      fontSizes: {
        xs: "var(--scale-xs)",
        sm: "var(--scale-sm)",
        md: "var(--scale-md)",
        lg: "var(--scale-lg)",
        xl: "var(--scale-xl)",
      },
      headings: {
        fontFamily: `var(--font-${fontFamily}), sans-serif`,
        sizes: {
          h1: { fontSize: "var(--scale-4xl)" },
          h2: { fontSize: "var(--scale-3xl)" },
          h3: { fontSize: "var(--scale-2xl)" },
          h4: { fontSize: "var(--scale-xl)" },
          h5: { fontSize: "var(--scale-lg)" },
          h6: { fontSize: "var(--scale-md)" },
        },
      },
      colors: {
        brand: [
          "var(--color-brand-50)",
          "var(--color-brand-100)",
          "var(--color-brand-200)",
          "var(--color-brand-300)",
          "var(--color-brand-400)",
          "var(--color-brand-500)",
          "var(--color-brand-600)",
          "var(--color-brand-700)",
          "var(--color-brand-800)",
          "var(--color-brand-900)",
        ],
      },
      components: {
        Button: {
          defaultProps: {
            fw: 500,
          },
        },
      },
    });
  }, [fontFamily, colorScheme]);

  return theme;
}
