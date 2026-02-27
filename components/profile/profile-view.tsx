"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  TextInput,
  Button,
  Stack,
  Title,
  Text,
  NumberInput,
  Group,
  Divider,
  Box,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import SignatureCanvas from "react-signature-canvas";
import { updateProfile } from "@/app/actions/profile";

interface ProfilePageProps {
  user: any;
}

export default function ProfileView({ user }: ProfilePageProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || "");
  const [monthEndDay, setMonthEndDay] = useState(user.monthEndDay || 30);
  const [signatureUrl, setSignatureUrl] = useState(user.signatureUrl || "");
  const [loading, setLoading] = useState(false);

  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        userId: user.id,
        firstName,
        lastName,
        phone,
        monthEndDay,
        signatureUrl,
      });
      notifications.show({
        title: "Success",
        message: "Profile updated successfully.",
        color: "success",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update profile.",
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureUrl("");
  };

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    setSignatureUrl(dataUrl || "");
  };

  return (
    <Stack gap="xl">
      <Title order={2} className="gradient-text">
        User Profile
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card withBorder radius="xl" className="premium-card">
          <Stack gap="md">
            <Title order={4} className="text-gray-900 dark:text-white">
              Personal Details
            </Title>
            <Group grow>
              <TextInput
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                radius="md"
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                radius="md"
              />
            </Group>
            <TextInput label="Email" value={user.email} disabled radius="md" />
            <TextInput
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256..."
              radius="md"
            />
          </Stack>
        </Card>

        <Card withBorder radius="xl" className="premium-card">
          <Stack gap="md">
            <Title order={4} className="text-gray-900 dark:text-white">
              Reporting Settings
            </Title>
            <NumberInput
              label="Month End Day"
              description="Day of the month when your monthly report triggers."
              value={monthEndDay}
              onChange={(val) => setMonthEndDay(Number(val))}
              min={1}
              max={30}
              radius="md"
            />
            <Divider className="border-gray-100 dark:border-white/5" />
            <Text
              size="sm"
              fw={800}
              className="text-gray-500 flex items-center gap-2"
            >
              CURRENT ROLE:{" "}
              <Badge
                color="brand"
                variant="filled"
                className="uppercase tracking-widest text-[10px] shadow-sm shadow-brand-500/10"
              >
                {user.role}
              </Badge>
            </Text>
            {user.department && (
              <Text
                size="sm"
                fw={800}
                className="text-gray-500 flex items-center gap-2"
              >
                DEPARTMENT:{" "}
                <span className="text-gray-900 dark:text-white font-black tracking-tight underline decoration-brand-500/30">
                  {user.department.name}
                </span>
              </Text>
            )}
            <Text size="sm" c="dimmed" className="italic">
              Account created on:{" "}
              {new Date(user.creationDate).toLocaleDateString()}
            </Text>
          </Stack>
        </Card>
      </div>

      <Card withBorder radius="xl" className="premium-card">
        <Stack gap="md">
          <Title order={4} className="text-gray-900 dark:text-white">
            Digital Signature
          </Title>
          <Text size="sm" className="text-gray-500 font-medium max-w-2xl">
            This signature will be automatically attached to all your submitted
            reports. Please ensure it is clear and professional.
          </Text>

          <Group align="flex-start" gap="xl" wrap="wrap">
            <Box className="flex-1 min-w-[300px]">
              <Text
                size="xs"
                mb={4}
                fw={800}
                className="uppercase tracking-widest text-gray-500"
              >
                DRAW SIGNATURE
              </Text>
              <Box className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden backdrop-blur-sm">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor={
                    typeof window !== "undefined" &&
                    document.documentElement.classList.contains("dark")
                      ? "#ffffff"
                      : "#000000"
                  }
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: "signature-canvas",
                    style: { width: "100%", height: "150px" },
                  }}
                  onEnd={saveSignature}
                />
              </Box>
              <Group mt="md">
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={clearSignature}
                  className="rounded-lg"
                >
                  Clear
                </Button>
                <Button
                  color="brand"
                  variant="filled"
                  size="sm"
                  onClick={saveSignature}
                  className="rounded-lg shadow-md shadow-brand-500/20"
                >
                  Capture Signature
                </Button>
              </Group>
            </Box>

            {signatureUrl && (
              <Box className="w-full md:w-auto">
                <Text
                  size="xs"
                  mb={4}
                  fw={800}
                  className="uppercase tracking-widest text-gray-500"
                >
                  PREVIEW
                </Text>
                <Box className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center min-w-[200px] backdrop-blur-sm">
                  <img
                    src={signatureUrl}
                    alt="Signature Preview"
                    className="max-h-24 w-auto brightness-90 contrast-125 dark:invert"
                  />
                </Box>
              </Box>
            )}
          </Group>
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button
          size="lg"
          color="brand"
          loading={loading}
          onClick={handleSave}
          className="rounded-xl px-12 shadow-xl shadow-brand-500/20"
        >
          Save Profile Changes
        </Button>
      </Group>
    </Stack>
  );
}
