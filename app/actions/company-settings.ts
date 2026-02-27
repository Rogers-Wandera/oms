"use server";

import { db } from "@/lib/db";
import { companySettings } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { safeAction } from "@/lib/actions-utils";

export async function getCompanySettings() {
  return safeAction(async () => {
    const settings = await db.select().from(companySettings).limit(1);
    return settings[0] || null;
  });
}

export async function updateCompanySettings(data: {
  companyName: string;
  headerText?: string;
  footerText?: string;
  logoUrl?: string;
  timezone: string;
  workingHours?: {
    day: string;
    startTime: string;
    endTime: string;
    isClosed: boolean;
  }[];
}) {
  return safeAction(async () => {
    const existing = await getCompanySettings();

    if (existing) {
      await db
        .update(companySettings)
        .set(data)
        .where(eq(companySettings.id, existing.id));
    } else {
      await db.insert(companySettings).values(data);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");
  });
}
