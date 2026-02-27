"use client";

import React, { useState } from "react";
import { UsersList } from "./users-list";
import { UserForm } from "./user-form";
import { Button, Group, Title, Text, Stack } from "@mantine/core";
import { Plus } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "@mantine/hooks";

interface AdminUsersViewProps {
  initialUsers: any[];
  departments: any[];
  supervisors: any[];
  shifts: any[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export function AdminUsersView({
  initialUsers,
  departments,
  supervisors,
  shifts,
  totalPages,
  currentPage,
  totalCount,
}: AdminUsersViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const updateUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((query: string) => {
    updateUrl({ q: query || null, page: "1" });
  }, 500);

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>{selectedUser ? "Edit User" : "Manage Users"}</Title>
          <Text c="dimmed" size="sm">
            {showForm
              ? selectedUser
                ? `Updating profile for ${selectedUser.name}`
                : "Fill in the details below to create a new user account."
              : "Review and manage all user accounts within the system."}
          </Text>
        </div>

        {!showForm && (
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setShowForm(true)}
          >
            Add New User
          </Button>
        )}
      </Group>

      {showForm ? (
        <UserForm
          departments={departments}
          supervisors={supervisors}
          shifts={shifts}
          initialData={selectedUser}
          onCancel={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      ) : (
        <UsersList
          users={initialUsers}
          departments={departments}
          supervisors={supervisors}
          shifts={shifts}
          totalPages={totalPages}
          currentPage={currentPage}
          totalCount={totalCount}
          onEdit={handleEdit}
          onPageChange={handlePageChange}
          onSearchChange={debouncedSearch}
          searchValue={searchParams.get("q") || ""}
        />
      )}
    </Stack>
  );
}
