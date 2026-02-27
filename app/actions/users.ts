"use server";

import { db } from "@/lib/db";
import { users, userShifts, shifts } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, ne, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function createUser({
  name,
  email,
  password,
  role,
  departmentId,
  supervisorId,
  shiftId,
}: {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId: string | null;
  supervisorId: string | null;
  shiftId?: string | null;
}) {
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      return { error: "A user with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const deptId = departmentId === "none" ? null : departmentId;
    const supId = supervisorId === "none" ? null : supervisorId;

    // Split name into first and last
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "User";

    const [newUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role as any,
        departmentId: deptId,
        supervisorId: supId,
      })
      .returning({ id: users.id });

    if (shiftId && shiftId !== "none") {
      await db.insert(userShifts).values({
        userId: newUser.id,
        shiftId: shiftId,
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create user" };
  }
}

export async function updateUser({
  id,
  name,
  email,
  role,
  departmentId,
  supervisorId,
  shiftId,
}: {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  supervisorId: string | null;
  shiftId?: string | null;
}) {
  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);

    if (existing.length > 0) {
      return { error: "A user with this email already exists" };
    }

    const deptId = departmentId === "none" ? null : departmentId;
    const supId = supervisorId === "none" ? null : supervisorId;

    // Split name into first and last
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "User";

    await db
      .update(users)
      .set({
        firstName,
        lastName,
        email,
        role: role as any,
        departmentId: deptId,
        supervisorId: supId,
        updateDate: new Date(),
      })
      .where(eq(users.id, id));

    // Update shift
    await db.delete(userShifts).where(eq(userShifts.userId, id));
    if (shiftId && shiftId !== "none") {
      await db.insert(userShifts).values({
        userId: id,
        shiftId: shiftId,
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}
