"use client";

import React, { useState } from "react";
import { UsersList } from "./users-list";
import { UserForm } from "./user-form";
import { Button, Group, Title, Text, Stack } from "@mantine/core";
import { Plus } from "lucide-react";

interface AdminUsersViewProps {
  initialUsers: any[];
  departments: any[];
  supervisors: any[];
  shifts: any[];
  totalPages: number;
  currentPage: number;
}

export function AdminUsersView({
  initialUsers,
  departments,
  supervisors,
  shifts,
  totalPages,
  currentPage,
}: AdminUsersViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
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
          onEdit={handleEdit}
        />
      )}
    </Stack>
  );
}
