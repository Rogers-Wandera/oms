"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Box,
  Alert,
  Stack,
  Center,
  ThemeIcon,
} from "@mantine/core";
import { Building2, AlertCircle, Info } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />

      <Container size={420} my={40} className="relative z-10 w-full px-4">
        <Center mb="xl">
          <Stack align="center" gap={0}>
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 backdrop-blur-sm shadow-xl shadow-brand-500/10">
              <Building2
                size={40}
                className="text-brand-600 dark:text-brand-400"
              />
            </div>
            <Title
              ta="center"
              mt="xl"
              fw={900}
              className="text-3xl tracking-tight text-gray-900 dark:text-white"
            >
              OMS <span className="gradient-text">Enterprise</span>
            </Title>
            <Text c="dimmed" size="sm" ta="center" className="font-medium mt-1">
              Mission-critical organization management
            </Text>
          </Stack>
        </Center>

        <Paper
          withBorder
          shadow="xl"
          p={36}
          radius="xl"
          className="premium-card bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              {(error || errorParam) && (
                <Alert
                  icon={<AlertCircle size={18} />}
                  title={
                    <Text fw={700} size="sm">
                      Access Denied
                    </Text>
                  }
                  color="error"
                  variant="light"
                  className="rounded-xl border border-error-500/20"
                >
                  <Text size="xs" fw={500}>
                    {errorParam === "Locked"
                      ? "Your account has been suspended for security reasons. Contact admin."
                      : error ||
                        "Verification failed. Please check your credentials."}
                  </Text>
                </Alert>
              )}

              <TextInput
                label={
                  <Text
                    size="xs"
                    fw={800}
                    className="uppercase tracking-widest text-gray-500 mb-1"
                  >
                    Corporate Email
                  </Text>
                }
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                disabled={isLoading}
                radius="md"
                size="md"
              />

              <Stack gap={6}>
                <PasswordInput
                  label={
                    <Text
                      size="xs"
                      fw={800}
                      className="uppercase tracking-widest text-gray-500 mb-1"
                    >
                      Security Key
                    </Text>
                  }
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={isLoading}
                  radius="md"
                  size="md"
                />
                <Group justify="flex-end">
                  <Anchor
                    component="button"
                    type="button"
                    size="xs"
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Reset password?
                  </Anchor>
                </Group>
              </Stack>

              <Checkbox
                label={
                  <Text
                    size="sm"
                    fw={500}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Trust this device for 30 days
                  </Text>
                }
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.currentTarget.checked)}
                color="brand"
              />

              <Button
                fullWidth
                mt="md"
                type="submit"
                loading={isLoading}
                size="lg"
                color="brand"
                className="rounded-xl shadow-lg shadow-brand-500/20 h-12"
              >
                Unlock Dashboard
              </Button>
            </Stack>
          </form>
        </Paper>

        <Stack align="center" mt="xl" gap={4}>
          <Text ta="center" size="xs" c="dimmed" fw={500}>
            Protected by End-to-End Enterprise Encryption
          </Text>
          <Text ta="center" size="xs" c="dimmed" className="font-bold">
            © 2026 OMS INC. SYSTEM ID:{" "}
            <span className="text-brand-500">ALPHA-9</span>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
