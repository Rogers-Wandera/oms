"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";

interface Department {
  id: string;
  name: string;
  creationDate: string;
  member_count: string;
}

interface DepartmentsListProps {
  departments: Department[];
}

export function DepartmentsList({ departments }: DepartmentsListProps) {
  if (departments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No departments created yet</p>
        <p className="text-sm mt-1">
          Create your first department to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {departments.map((dept) => (
        <Card key={dept.id} className="premium-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg border-brand-500/20 bg-brand-500/5 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-[10px]"
              >
                <Users className="w-3.5 h-3.5" />
                {dept.member_count} Members
              </Badge>
            </div>
            <CardTitle className="mt-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {dept.name}
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium">
              Established{" "}
              {new Date(dept.creationDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
