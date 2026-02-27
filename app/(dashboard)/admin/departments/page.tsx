import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DepartmentsList } from "@/components/admin/departments-list";
import { CreateDepartmentButton } from "@/components/admin/create-department-button";

import { db } from "@/lib/db";
import { departments, users } from "@/lib/db/schema";
import { eq, sql, asc } from "drizzle-orm";

async function getDepartments() {
  const results = await db
    .select({
      id: departments.id,
      name: departments.name,
      createdBy: departments.createdBy,
      creationDate: departments.creationDate,
      memberCount: sql<number>`count(${users.id})`,
    })
    .from(departments)
    .leftJoin(users, eq(departments.id, users.departmentId))
    .groupBy(departments.id)
    .orderBy(asc(departments.name));

  return results.map((d) => ({
    id: d.id,
    name: d.name,
    createdBy: d.createdBy,
    creation_date: d.creationDate.toISOString(),
    creationDate: d.creationDate.toISOString(), // Fix type mapping
    member_count: String(d.memberCount || 0),
  }));
}

export default async function AdminDepartmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage organization departments
          </p>
        </div>
        <CreateDepartmentButton />
      </div>

      <DepartmentsList departments={departments} />
    </div>
  );
}
