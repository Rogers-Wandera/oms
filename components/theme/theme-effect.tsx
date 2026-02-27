"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";

export function ThemeEffect() {
  const {
    fontFamily,
    fontSize,
    colorScheme,
    layout,
    layoutWidth,
    isSidebarExpanded,
  } = useSettings();

  // Font Family
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-family",
      `var(--font-${fontFamily})`,
    );
    document.body.style.fontFamily = `var(--font-${fontFamily})`;
  }, [fontFamily]);

  // Font Size (Scaling)
  useEffect(() => {
    document.documentElement.classList.remove(
      "font-mode-xs",
      "font-mode-sm",
      "font-mode-md",
      "font-mode-lg",
      "font-mode-xl",
    );
    document.documentElement.classList.add(`font-mode-${fontSize}`);
  }, [fontSize]);

  // Color Scheme
  useEffect(() => {
    const schemes = [
      "default",
      "brand",
      "blue",
      "orange",
      "success",
      "error",
      "warning",
      "purple",
      "pink",
      "dark",
    ];

    schemes.forEach((scheme) => {
      document.documentElement.classList.remove(`color-scheme-${scheme}`);
    });

    document.documentElement.classList.add(`color-scheme-${colorScheme}`);
  }, [colorScheme]);

  // Layout
  useEffect(() => {
    document.documentElement.classList.remove(
      "layout-default",
      "layout-horizontal",
      "layout-mini",
    );
    document.documentElement.classList.add(`layout-${layout}`);
  }, [layout]);

  // Layout Width
  useEffect(() => {
    if (layoutWidth === "container") {
      document.documentElement.classList.add("layout-container");
    } else {
      document.documentElement.classList.remove("layout-container");
    }
  }, [layoutWidth]);

  // Sidebar State
  useEffect(() => {
    if (isSidebarExpanded) {
      document.documentElement.classList.remove("sidebar-collapsed");
    } else {
      document.documentElement.classList.add("sidebar-collapsed");
    }
  }, [isSidebarExpanded]);

  return null;
}
