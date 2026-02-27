"use client";

import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  colors: {
    brand: [
      "#ecf3ff", // 50
      "#dde9ff", // 100
      "#c2d6ff", // 200
      "#9cb9ff", // 300
      "#7592ff", // 400
      "#465fff", // 500
      "#3641f5", // 600
      "#2a31d8", // 700
      "#252dae", // 800
      "#262e89", // 900
    ],
  },
  primaryColor: "brand",
  defaultRadius: "md",
  fontFamily: "Outfit, sans-serif",
  headings: {
    fontFamily: "Outfit, sans-serif",
    sizes: {
      h1: { fontSize: rem(32), fontWeight: "700" },
      h2: { fontSize: rem(26), fontWeight: "600" },
      h3: { fontSize: rem(22), fontWeight: "600" },
    },
  },
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        striped: true, // Use striped for better readability as implied
        verticalSpacing: "sm",
      },
    },
  },
});
