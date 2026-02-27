"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateProfile({
  userId,
  firstName,
  lastName,
  phone,
  monthEndDay,
  signatureUrl,
}: {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  monthEndDay?: number;
  signatureUrl?: string;
}) {
  await db
    .update(users)
    .set({
      firstName,
      lastName,
      phone,
      monthEndDay,
      signatureUrl,
      updateDate: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}
