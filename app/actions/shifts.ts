"use server";

import { db } from "@/lib/db";
import { shifts, userShifts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getShifts() {
  return await db.query.shifts.findMany();
}

export async function createShift(data: {
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
}) {
  await db.insert(shifts).values(data);
  revalidatePath("/admin/settings");
}

export async function deleteShift(id: string) {
  await db.delete(shifts).where(eq(shifts.id, id));
  revalidatePath("/admin/settings");
}

export async function assignShift(userId: string, shiftId: string) {
  await db.insert(userShifts).values({ userId, shiftId });
  revalidatePath("/admin/users");
}
