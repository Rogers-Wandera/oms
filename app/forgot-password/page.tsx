"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  Stack,
  Title,
  Text,
  Container,
  Center,
  Alert,
  Anchor,
  Group,
  Box,
  Paper,
} from "@mantine/core";
import { Key, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/app/actions/password-reset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError("Could not process your request. Please try again later.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />

      <Container size={420} my={40} className="relative z-10 w-full px-4">
        <Center mb="xl">
          <Stack align="center" gap={0}>
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 backdrop-blur-sm shadow-xl shadow-brand-500/10">
              <Key size={40} className="text-brand-600 dark:text-brand-400" />
            </div>
            <Title
              ta="center"
              mt="xl"
              fw={900}
              className="text-3xl tracking-tight text-gray-900 dark:text-white"
            >
              Recovery <span className="gradient-text">Protocol</span>
            </Title>
            <Text c="dimmed" size="sm" ta="center" className="font-medium mt-1">
              Reset your corporate access credentials
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
          <Stack gap="lg">
            {submitted ? (
              <Stack align="center" gap="md">
                <Alert
                  color="success"
                  variant="light"
                  icon={<CheckCircle size={18} />}
                  title={
                    <Text fw={700} size="sm">
                      Verification Link Sent
                    </Text>
                  }
                  className="rounded-xl border border-success-500/20 w-full"
                >
                  <Text size="xs" fw={500}>
                    Check your inbox for a recovery link. It will expire in 1
                    hour for security reasons.
                  </Text>
                </Alert>
                <Button
                  variant="filled"
                  color="brand"
                  fullWidth
                  onClick={() => router.push("/login")}
                  className="rounded-xl h-11"
                >
                  Return to System Login
                </Button>
              </Stack>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  {error && (
                    <Alert
                      color="error"
                      variant="light"
                      title={
                        <Text fw={700} size="sm">
                          Verification Error
                        </Text>
                      }
                      className="rounded-xl border border-error-500/20"
                    >
                      <Text size="xs" fw={500}>
                        {error}
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
                    leftSection={<Mail size={16} className="text-gray-400" />}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    disabled={loading}
                    radius="md"
                    size="md"
                  />
                  <Button
                    fullWidth
                    type="submit"
                    loading={loading}
                    color="brand"
                    className="rounded-xl shadow-lg shadow-brand-500/20 h-12"
                  >
                    Authorize Recovery
                  </Button>
                  <Center>
                    <Anchor
                      component="button"
                      type="button"
                      size="xs"
                      className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      onClick={() => router.push("/login")}
                    >
                      <Group gap={6}>
                        <ArrowLeft size={14} />
                        Abort and return to sign in
                      </Group>
                    </Anchor>
                  </Center>
                </Stack>
              </form>
            )}
          </Stack>
        </Paper>

        <Stack align="center" mt="xl" gap={4}>
          <Text ta="center" size="xs" c="dimmed" fw={500}>
            Protected by End-to-End Enterprise Encryption
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
