"use client";

import { useState, useEffect } from "react";
import {
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Container,
  Center,
  Alert,
  Box,
  Paper,
} from "@mantine/core";
import { ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "@/app/actions/password-reset";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await confirmPasswordReset(token!, password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to reset password.");
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />

      <Container size={420} my={40} className="relative z-10 w-full px-4">
        <Center mb="xl">
          <Stack align="center" gap={0}>
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 backdrop-blur-sm shadow-xl shadow-brand-500/10">
              <ShieldCheck
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
              Security <span className="gradient-text">Update</span>
            </Title>
            <Text c="dimmed" size="sm" ta="center" className="font-medium mt-1">
              Finalize your new access credentials
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
            {success ? (
              <Stack align="center" gap="md">
                <Alert
                  color="success"
                  variant="light"
                  icon={<CheckCircle size={18} />}
                  title={
                    <Text fw={700} size="sm">
                      Security Reset Successful
                    </Text>
                  }
                  className="rounded-xl border border-success-500/20 w-full"
                >
                  <Text size="xs" fw={500}>
                    Your password has been updated. You can now access the
                    system with your new credentials.
                  </Text>
                </Alert>
                <Button
                  variant="filled"
                  color="brand"
                  fullWidth
                  onClick={() => router.push("/login")}
                  className="rounded-xl h-11"
                >
                  Return to Dashboard Access
                </Button>
              </Stack>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  {error && (
                    <Alert
                      color="error"
                      variant="light"
                      icon={<AlertTriangle size={18} />}
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
                  <PasswordInput
                    label={
                      <Text
                        size="xs"
                        fw={800}
                        className="uppercase tracking-widest text-gray-500 mb-1"
                      >
                        New Security Key
                      </Text>
                    }
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    disabled={loading || !token}
                    radius="md"
                    size="md"
                  />
                  <PasswordInput
                    label={
                      <Text
                        size="xs"
                        fw={800}
                        className="uppercase tracking-widest text-gray-500 mb-1"
                      >
                        Confirm Security Key
                      </Text>
                    }
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                    disabled={loading || !token}
                    radius="md"
                    size="md"
                  />
                  <Button
                    fullWidth
                    type="submit"
                    loading={loading}
                    disabled={!token}
                    color="brand"
                    className="rounded-xl shadow-lg shadow-brand-500/20 h-12"
                  >
                    Authorize Reset
                  </Button>
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
