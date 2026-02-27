import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminUsersView } from "@/components/admin/admin-users-view";

import { db } from "@/lib/db";
import { users, departments, userShifts, shifts } from "@/lib/db/schema";
import { eq, or, and, sql, asc, desc, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getShifts } from "@/app/actions/shifts";

async function getUsers(page = 1, pageSize = 10, query?: string) {
  const supervisor = alias(users, "supervisor");
  const offset = (page - 1) * pageSize;

  const whereConditions = [];
  if (query) {
    whereConditions.push(
      or(
        ilike(users.firstName, `%${query}%`),
        ilike(users.lastName, `%${query}%`),
        ilike(users.email, `%${query}%`),
      ),
    );
  }

  const [totalCountResult, results] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
    db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        creationDate: users.creationDate,
        departmentName: departments.name,
        departmentId: departments.id,
        supervisorId: supervisor.id,
        supervisorFirstName: supervisor.firstName,
        supervisorLastName: supervisor.lastName,
        shiftName: shifts.name,
        shiftId: shifts.id,
        isLocked: users.isLocked,
        isOnline: users.isOnline,
        lastLoginDate: users.lastLoginDate,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .leftJoin(supervisor, eq(users.supervisorId, supervisor.id))
      .leftJoin(userShifts, eq(users.id, userShifts.userId))
      .leftJoin(shifts, eq(userShifts.shiftId, shifts.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(users.creationDate))
      .limit(pageSize)
      .offset(offset),
  ]);

  const totalCount = Number(totalCountResult[0].count);

  return {
    data: results.map((u) => ({
      ...u,
      name: `${u.firstName} ${u.lastName}`.trim(),
      supervisor_name: u.supervisorFirstName
        ? `${u.supervisorFirstName} ${u.supervisorLastName}`.trim()
        : null,
      supervisor_id: u.supervisorId,
      department_name: u.departmentName,
      department_id: u.departmentId,
      shift_name: u.shiftName,
      shift_id: u.shiftId,
      creation_date: u.creationDate.toISOString(),
      is_locked: u.isLocked,
      is_online: u.isOnline,
      last_login: u.lastLoginDate?.toISOString(),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

async function getDepartments() {
  const results = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .orderBy(asc(departments.name));
  return results;
}

async function getSupervisors() {
  const results = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(or(eq(users.role, "SUPERVISOR"), eq(users.role, "ADMIN")))
    .orderBy(asc(users.firstName));

  return results.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
  }));
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { page: pageParam, q: query } = await searchParams;
  const page = Number(pageParam) || 1;
  const pageSize = 10;

  const [usersData, departmentsList, supervisorsList, shiftsList] =
    await Promise.all([
      getUsers(page, pageSize, query),
      getDepartments(),
      getSupervisors(),
      getShifts(),
    ]);

  return (
    <AdminUsersView
      initialUsers={usersData.data}
      departments={departmentsList}
      supervisors={supervisorsList}
      shifts={shiftsList}
      totalPages={usersData.totalPages}
      currentPage={page}
      totalCount={usersData.totalCount}
    />
  );
}
