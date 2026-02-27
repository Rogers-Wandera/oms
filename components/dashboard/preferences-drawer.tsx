"use client";

import {
  Drawer,
  Stack,
  Switch,
  Group,
  Text,
  Divider,
  Select,
  Title,
  Button,
  ColorSchemeScript,
  useMantineColorScheme,
  UnstyledButton,
  Indicator,
  Box,
  Tooltip,
} from "@mantine/core";
import {
  Settings,
  Eye,
  Bell,
  Shield,
  Palette,
  Type,
  Maximize,
  Layout,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import {
  FontFamily,
  FontSize,
  ColorScheme,
  LayoutType,
  LayoutWidth,
} from "@/components/providers/settings-provider";

interface PreferencesDrawerProps {
  opened: boolean;
  onClose: () => void;
  userSettings: any;
}

export function PreferencesDrawer({
  opened,
  onClose,
  userSettings,
}: PreferencesDrawerProps) {
  const { theme, setTheme } = useTheme();
  const {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    colorScheme,
    setColorScheme,
    layout,
    setLayout,
    layoutWidth,
    setLayoutWidth,
    isSidebarExpanded,
    setSidebarExpanded,
  } = useSettings();
  const [loading, setLoading] = useState(false);

  const colors: { name: string; value: ColorScheme; color: string }[] = [
    { name: "Default", value: "default", color: "#101828" },
    { name: "Brand", value: "brand", color: "#465fff" },
    { name: "Ocean", value: "blue", color: "#0ba5ec" },
    { name: "Energy", value: "orange", color: "#fb6514" },
    { name: "Growth", value: "success", color: "#12b76a" },
    { name: "Vibe", value: "purple", color: "#7a5af8" },
    { name: "Love", value: "pink", color: "#ee46bc" },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
            <Settings size={18} className="text-brand-500" />
          </div>
          <div>
            <Text fw={700} className="text-gray-900 dark:text-white">
              System Customization
            </Text>
            <Text size="xs" className="text-gray-500 font-medium">
              Fine-tune your dashboard experience
            </Text>
          </div>
        </Group>
      }
      position="right"
      size="md"
      classNames={{
        header: "border-b border-gray-100 dark:border-white/5 py-4",
        body: "p-0",
      }}
    >
      <Stack gap={0}>
        <div className="p-6 space-y-8 h-[calc(100vh-140px)] overflow-y-auto">
          {/* Appearance Section */}
          <section>
            <Group gap="xs" mb="lg">
              <Palette size={16} className="text-brand-500" />
              <Text
                fw={600}
                size="sm"
                className="uppercase tracking-wider text-gray-500"
              >
                Theme & Mood
              </Text>
            </Group>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <UnstyledButton
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === "light" ? "bg-brand-50 border-brand-500 ring-1 ring-brand-500" : "bg-gray-50 border-gray-100 hover:border-brand-300"}`}
              >
                <div
                  className={`p-2 rounded-full ${theme === "light" ? "bg-brand-500 text-white" : "bg-white text-gray-400 border border-gray-200"}`}
                >
                  <Sun size={20} />
                </div>
                <Text
                  size="xs"
                  fw={700}
                  className={
                    theme === "light" ? "text-brand-600" : "text-gray-500"
                  }
                >
                  Light Mode
                </Text>
              </UnstyledButton>

              <UnstyledButton
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === "dark" ? "bg-brand-500/10 border-brand-500 ring-1 ring-brand-500" : "bg-gray-900/50 border-white/5 hover:border-brand-500/30"}`}
              >
                <div
                  className={`p-2 rounded-full ${theme === "dark" ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-400 border border-white/10"}`}
                >
                  <Moon size={20} />
                </div>
                <Text
                  size="xs"
                  fw={700}
                  className={
                    theme === "dark" ? "text-brand-400" : "text-gray-500"
                  }
                >
                  Dark Mode
                </Text>
              </UnstyledButton>
            </div>

            <Text
              size="xs"
              fw={700}
              className="mb-3 text-gray-500 uppercase tracking-widest"
            >
              Accent Color
            </Text>
            <Group gap="sm" mb="xl">
              {colors.map((c) => (
                <Tooltip key={c.value} label={c.name} withArrow>
                  <UnstyledButton
                    onClick={() => setColorScheme(c.value)}
                    className="relative flex items-center justify-center p-0.5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      borderColor:
                        colorScheme === c.value ? c.color : "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-lg"
                      style={{ backgroundColor: c.color }}
                    >
                      {colorScheme === c.value && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </UnstyledButton>
                </Tooltip>
              ))}
            </Group>
          </section>

          <Divider className="border-gray-100 dark:border-white/5" />

          {/* Typography Section */}
          <section>
            <Group gap="xs" mb="lg">
              <Type size={16} className="text-orange-500" />
              <Text
                fw={600}
                size="sm"
                className="uppercase tracking-wider text-gray-500"
              >
                Typography
              </Text>
            </Group>

            <Stack gap="md">
              <Select
                label="Font Family"
                data={[
                  { value: "inter", label: "Inter (Premium Sans)" },
                  { value: "outfit", label: "Outfit (Geometric)" },
                  { value: "poppins", label: "Poppins (Modern)" },
                  { value: "roboto", label: "Roboto (Classic)" },
                  { value: "public-sans", label: "Public Sans (Clean)" },
                ]}
                value={fontFamily}
                onChange={(val) => setFontFamily(val as FontFamily)}
                className="font-medium"
              />

              <Select
                label="Font Size Scaling"
                data={[
                  { value: "xs", label: "Extra Small" },
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium (Default)" },
                  { value: "lg", label: "Large" },
                  { value: "xl", label: "Extra Large" },
                ]}
                value={fontSize}
                onChange={(val) => setFontSize(val as FontSize)}
              />
            </Stack>
          </section>

          <Divider className="border-gray-100 dark:border-white/5" />

          {/* Layout Section */}
          <section>
            <Group gap="xs" mb="lg">
              <Layout size={16} className="text-success-500" />
              <Text
                fw={600}
                size="sm"
                className="uppercase tracking-wider text-gray-500"
              >
                Dashboard Layout
              </Text>
            </Group>

            <Stack gap="md">
              <Select
                label="Navigation Style"
                data={[
                  { value: "default", label: "Side Sidebar (Default)" },
                  { value: "mini", label: "Mini Sidebar" },
                  { value: "horizontal", label: "Top Navigation" },
                ]}
                value={layout}
                onChange={(val) => setLayout(val as LayoutType)}
              />

              <Select
                label="Content Width"
                data={[
                  { value: "fluid", label: "Full Width (Fluid)" },
                  { value: "container", label: "Centered (Capped)" },
                ]}
                value={layoutWidth}
                onChange={(val) => setLayoutWidth(val as LayoutWidth)}
              />

              <Switch
                label="Sidebar expanded by default"
                checked={isSidebarExpanded}
                onChange={(e) => setSidebarExpanded(e.currentTarget.checked)}
                className="mt-2"
              />
            </Stack>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 backdrop-blur-xl">
          <Button
            fullWidth
            size="lg"
            onClick={onClose}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 rounded-xl font-bold tracking-wide"
          >
            Close & Save Preferences
          </Button>
        </div>
      </Stack>
    </Drawer>
  );
}
