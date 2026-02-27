"use client";

import React, { useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Select,
  Group,
  Button,
  Stack,
  Title,
  Text,
  Alert,
} from "@mantine/core";
import { AlertCircle, Save, X } from "lucide-react";
import { createUser, updateUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";

interface Department {
  id: string;
  name: string;
}

interface Supervisor {
  id: string;
  name: string;
}

interface UserFormProps {
  departments: Department[];
  supervisors: Supervisor[];
  shifts: { id: string; name: string }[];
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export function UserForm({
  departments,
  supervisors,
  shifts,
  initialData,
  onCancel,
  onSuccess,
}: UserFormProps) {
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "USER",
    departmentId: initialData?.department_id || "",
    supervisorId: initialData?.supervisor_id || "",
    shiftId: initialData?.shift_id || "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        departmentId:
          formData.departmentId === "none"
            ? null
            : formData.departmentId || null,
        supervisorId:
          formData.supervisorId === "none"
            ? null
            : formData.supervisorId || null,
        shiftId: formData.shiftId === "none" ? null : formData.shiftId || null,
      };

      const result = isEdit
        ? await updateUser({ id: initialData.id, ...payload })
        : await createUser(payload);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" padding="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>{isEdit ? "Edit User" : "Create New User"}</Title>
            <Button variant="subtle" color="gray" onClick={onCancel}>
              <X size={16} className="mr-2" /> Discard Changes
            </Button>
          </Group>

          {error && (
            <Alert
              variant="light"
              color="red"
              title="Error"
              icon={<AlertCircle size={16} />}
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            disabled={isLoading}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextInput
            label="Email Address"
            placeholder="john@company.com"
            required
            type="email"
            disabled={isLoading}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <PasswordInput
            label={
              isEdit ? "New Password (Leave blank to keep current)" : "Password"
            }
            placeholder={isEdit ? "Enter new password" : "Minimum 6 characters"}
            required={!isEdit}
            disabled={isLoading}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <Select
            label="System Role"
            data={[
              { value: "USER", label: "Standard Employee" },
              { value: "SUPERVISOR", label: "Supervisor" },
              { value: "MANAGER", label: "Manager" },
              { value: "ADMIN", label: "Administrator" },
            ]}
            value={formData.role}
            onChange={(val) =>
              setFormData({ ...formData, role: val || "USER" })
            }
            disabled={isLoading}
          />

          <Select
            label="Department"
            placeholder="Select department"
            data={[
              { value: "none", label: "No Department" },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            value={formData.departmentId}
            onChange={(val) =>
              setFormData({ ...formData, departmentId: val || "" })
            }
            disabled={isLoading}
          />

          <Select
            label="Working Shift"
            placeholder="Select shift"
            data={[
              { value: "none", label: "No Shift" },
              ...shifts.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={formData.shiftId}
            onChange={(val) => setFormData({ ...formData, shiftId: val || "" })}
            disabled={isLoading}
          />

          {formData.role === "USER" && (
            <Select
              label="Immediate Supervisor"
              placeholder="Select supervisor"
              data={[
                { value: "none", label: "No Supervisor" },
                ...supervisors.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={formData.supervisorId}
              onChange={(val) =>
                setFormData({ ...formData, supervisorId: val || "" })
              }
              disabled={isLoading}
            />
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={<Save size={16} />}
            >
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
