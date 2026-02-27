"use server";

import { db } from "@/lib/db";
import { timeExtensions, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function requestExtension({
  userId,
  extendedUntil,
  reason,
}: {
  userId: string;
  extendedUntil: Date;
  reason: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  await db.insert(timeExtensions).values({
    userId,
    date: today,
    extendedUntil,
    reason,
    status: "PENDING",
  });

  revalidatePath("/dashboard");
}

export async function approveExtension(extensionId: string, adminId: string) {
  await db
    .update(timeExtensions)
    .set({
      status: "APPROVED",
      approvedBy: adminId,
      updateDate: new Date(),
    })
    .where(eq(timeExtensions.id, extensionId));

  revalidatePath("/dashboard");
  revalidatePath("/admin/settings"); // Or wherever the management is
}

export async function rejectExtension(extensionId: string, adminId: string) {
  await db
    .update(timeExtensions)
    .set({
      status: "REJECTED",
      approvedBy: adminId,
      updateDate: new Date(),
    })
    .where(eq(timeExtensions.id, extensionId));

  revalidatePath("/dashboard");
}

export async function getPendingExtensions() {
  return await db.query.timeExtensions.findMany({
    where: eq(timeExtensions.status, "PENDING"),
    with: {
      user: true,
    },
    orderBy: [desc(timeExtensions.creationDate)],
  });
}
