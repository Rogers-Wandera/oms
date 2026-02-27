"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  TextInput,
  Select,
  Stack,
  PasswordInput,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Plus } from "lucide-react";
import { createUser } from "@/app/actions/users";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface Department {
  id: string;
  name: string;
}

interface Supervisor {
  id: string;
  name: string;
}

interface CreateUserButtonProps {
  departments: Department[];
  supervisors: Supervisor[];
}

export function CreateUserButton({
  departments,
  supervisors,
}: CreateUserButtonProps) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      departmentId: "",
      supervisorId: "",
    },
    validate: {
      name: (val) => (val.length < 2 ? "Name is too short" : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) => (val.length < 6 ? "Password too short" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const result = await createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        departmentId: values.departmentId || null,
        supervisorId: values.supervisorId || null,
      });

      if (result.error) {
        notifications.show({
          title: "Error",
          message: result.error,
          color: "red",
        });
      } else {
        notifications.show({
          title: "Success",
          message: "User created successfully",
          color: "green",
        });
        setOpened(false);
        form.reset();
        router.refresh();
      }
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const departmentData = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const supervisorData = supervisors.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <>
      <Button leftSection={<Plus size={16} />} onClick={() => setOpened(true)}>
        Add User
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create New User"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              placeholder="john@company.com"
              withAsterisk
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="******"
              withAsterisk
              {...form.getInputProps("password")}
            />

            <Select
              label="Role"
              data={[
                { value: "USER", label: "User" },
                { value: "SUPERVISOR", label: "Supervisor" },
                { value: "MANAGER", label: "Manager" },
                { value: "ADMIN", label: "Admin" },
              ]}
              {...form.getInputProps("role")}
            />

            <Select
              label="Department"
              placeholder="Select department"
              data={departmentData}
              searchable
              limit={10}
              clearable
              {...form.getInputProps("departmentId")}
            />

            {form.values.role === "USER" && (
              <Select
                label="Supervisor"
                placeholder="Assign supervisor"
                data={supervisorData}
                searchable
                limit={10}
                clearable
                {...form.getInputProps("supervisorId")}
              />
            )}

            <Button type="submit" loading={loading} fullWidth mt="md">
              Create User
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
