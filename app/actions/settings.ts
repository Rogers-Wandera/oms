"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

export async function updateUserSetting(key: string, value: any) {
  return safeAction(async () => {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
        return { error: "Unauthorized" };
      }
      const userId = session.user.id;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return { error: "User not found" };
      }

      // deep merge settings
      const currentSettings = user.settings;

      const newSettings = { ...currentSettings };

      // Key mapping for database persistence
      if (key === "fontSize") {
        newSettings.accessibility = {
          ...newSettings.accessibility,
          fontSize: value,
        };
      } else if (
        [
          "theme",
          "fontFamily",
          "colorScheme",
          "layout",
          "layoutWidth",
          "isSidebarExpanded",
        ].includes(key)
      ) {
        newSettings.appearance = {
          ...newSettings.appearance,
          [key]: value,
        };
      }

      await db
        .update(users)
        .set({ settings: newSettings })
        .where(eq(users.id, userId));

      revalidatePath("/");
      return { success: true };
    } catch (error) {
      console.error("Failed to update setting:", error);
      return { error: "Failed to update setting" };
    }
  });
}
