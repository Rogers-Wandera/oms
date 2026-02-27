import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Manager - Daily Reporting System",
  description:
    "Office management and daily reporting system for tracking attendance, tasks, and productivity",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { SocketProvider } from "@/components/providers/socket-provider";
// import { theme } from "@/lib/theme"; // Using dynamic theme now
import { SettingsProvider } from "@/components/providers/settings-provider";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Force dark mode implementation if needed, though Mantine handles it via defaultColorScheme

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  let initialSettings = {};

  if (session?.user?.id) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        settings: true,
      },
    });

    if (user?.settings) {
      // Map DB settings structure to flat initialSettings
      // Use optional chaining and nullish coalescing to handle potential missing keys in existing JSON data
      const appearance = user.settings.appearance || {};
      const accessibility = user.settings.accessibility || {};

      initialSettings = {
        fontFamily: appearance.fontFamily ?? undefined,
        colorScheme: appearance.colorScheme ?? undefined,
        layout: appearance.layout ?? undefined,
        layoutWidth: appearance.layoutWidth ?? undefined,
        isSidebarExpanded: appearance.isSidebarExpanded ?? undefined,
        fontSize: accessibility.fontSize ?? undefined,
      };

      // Remove undefined keys so they don't override defaults in SettingsProvider
      Object.keys(initialSettings).forEach(
        (key) =>
          (initialSettings as any)[key] === undefined &&
          delete (initialSettings as any)[key],
      );
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={`antialiased dark:bg-gray-950`}>
        <SettingsProvider initialSettings={initialSettings}>
          <AppThemeProvider>
            <SessionProvider>
              <SocketProvider>{children}</SocketProvider>
            </SessionProvider>
          </AppThemeProvider>
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
