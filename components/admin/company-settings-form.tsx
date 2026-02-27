"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  Stack,
  Title,
  Card,
  Text,
  Group,
  Select,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { updateCompanySettings } from "@/app/actions/company-settings";
import { notifications } from "@mantine/notifications";
import { Checkbox } from "@mantine/core";

interface CompanySettingsFormProps {
  initialData: {
    companyName: string;
    headerText: string | null;
    footerText: string | null;
    logoUrl: string | null;
    timezone: string;
    workingHours: {
      day: string;
      startTime: string;
      endTime: string;
      isClosed: boolean;
    }[];
  } | null;
}

export function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      companyName: initialData?.companyName || "",
      headerText: initialData?.headerText || "",
      footerText: initialData?.footerText || "",
      logoUrl: initialData?.logoUrl || "",
      timezone: initialData?.timezone || "Africa/Kampala",
      workingHours: initialData?.workingHours || [
        { day: "Mon", startTime: "08:00", endTime: "17:00", isClosed: false },
        { day: "Tue", startTime: "08:00", endTime: "17:00", isClosed: false },
        { day: "Wed", startTime: "08:00", endTime: "17:00", isClosed: false },
        { day: "Thu", startTime: "08:00", endTime: "17:00", isClosed: false },
        { day: "Fri", startTime: "08:00", endTime: "17:00", isClosed: false },
        { day: "Sat", startTime: "09:00", endTime: "14:00", isClosed: false },
        { day: "Sun", startTime: "00:00", endTime: "00:00", isClosed: true },
      ],
    },
    validate: {
      companyName: (value) =>
        value.length < 2 ? "Company name is too short" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await updateCompanySettings(values);
      notifications.show({
        title: "Success",
        message: "Company settings updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update company settings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title order={3}>General Settings</Title>
            <Text size="sm" c="dimmed">
              Configure global application settings and report headers.
            </Text>

            <Group grow>
              <TextInput
                label="Company Name"
                placeholder="e.g. My Awesome Office"
                required
                {...form.getInputProps("companyName")}
              />
              <Select
                label="Default Timezone"
                data={[
                  { value: "Africa/Kampala", label: "Kampala (GMT+3)" },
                  { value: "UTC", label: "UTC" },
                  { value: "Africa/Nairobi", label: "Nairobi (GMT+3)" },
                ]}
                {...form.getInputProps("timezone")}
              />
            </Group>

            <TextInput
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              {...form.getInputProps("logoUrl")}
            />

            <Group grow>
              <TextInput
                label="Report Header Text"
                placeholder="Standard header"
                {...form.getInputProps("headerText")}
              />
              <TextInput
                label="Report Footer Text"
                placeholder="Standard footer"
                {...form.getInputProps("footerText")}
              />
            </Group>
          </Stack>

          <Divider
            my="xl"
            label="Official Working Hours"
            labelPosition="center"
          />

          <Stack gap="xs">
            {form.values.workingHours.map((item, index) => (
              <Group key={item.day} grow align="flex-end">
                <Text fw={700} w={60}>
                  {item.day}
                </Text>
                <TextInput
                  placeholder="08:00"
                  disabled={item.isClosed}
                  {...form.getInputProps(`workingHours.${index}.startTime`)}
                />
                <TextInput
                  placeholder="17:00"
                  disabled={item.isClosed}
                  {...form.getInputProps(`workingHours.${index}.endTime`)}
                />
                <Checkbox
                  label="Closed"
                  {...form.getInputProps(`workingHours.${index}.isClosed`, {
                    type: "checkbox",
                  })}
                />
              </Group>
            ))}
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Button type="submit" loading={loading} bg="blue">
              Save All Changes
            </Button>
          </Group>
        </form>
      </Card>
    </Stack>
  );
}
