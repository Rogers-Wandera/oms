"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FontFamily =
  | "outfit"
  | "inter"
  | "roboto"
  | "poppins"
  | "public-sans";
export type FontSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ColorScheme =
  | "default"
  | "brand"
  | "blue"
  | "orange"
  | "success"
  | "error"
  | "warning"
  | "purple"
  | "pink"
  | "dark";
export type LayoutType = "default" | "horizontal" | "mini";
export type LayoutWidth = "fluid" | "container";

interface SettingsState {
  fontFamily: FontFamily;
  fontSize: FontSize;
  colorScheme: ColorScheme;
  layout: LayoutType;
  layoutWidth: LayoutWidth;
  isSidebarExpanded: boolean;
}

interface SettingsContextType extends SettingsState {
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setLayout: (layout: LayoutType) => void;
  setLayoutWidth: (width: LayoutWidth) => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

const defaultSettings: SettingsState = {
  fontFamily: "outfit",
  fontSize: "md",
  colorScheme: "default",
  layout: "default",
  layoutWidth: "fluid",
  isSidebarExpanded: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<SettingsState>;
}) {
  const [settings, setSettings] = useState<SettingsState>(() => ({
    ...defaultSettings,
    ...initialSettings,
  }));

  const updateSettings = async (key: keyof SettingsState, value: any) => {
    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Persist to server
    try {
      const { updateUserSetting } = await import("@/app/actions/settings");
      await updateUserSetting(key, value);
    } catch (error) {
      console.error("Failed to save setting:", error);
      // Optionally revert state here if critical
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setFontFamily: (val) => updateSettings("fontFamily", val),
        setFontSize: (val) => updateSettings("fontSize", val),
        setColorScheme: (val) => updateSettings("colorScheme", val),
        setLayout: (val) => updateSettings("layout", val),
        setLayoutWidth: (val) => updateSettings("layoutWidth", val),
        setSidebarExpanded: (val) => updateSettings("isSidebarExpanded", val),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
