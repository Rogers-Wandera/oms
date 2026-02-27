"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createDepartment(name: string) {
  try {
    const existing = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.name, name))
      .limit(1);

    if (existing.length > 0) {
      return { error: "A department with this name already exists" };
    }

    await db.insert(departments).values({ name });

    revalidatePath("/admin/departments", "layout");
    revalidatePath("/admin/users", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error creating department:", error);
    return { error: "Failed to create department" };
  }
}
