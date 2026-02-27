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
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import SignatureCanvas from "react-signature-canvas";
import { updateProfile } from "@/app/actions/profile";
import {
  confirmTwoFactorSetup,
  disableTwoFactorWithCode,
  startTwoFactorSetup,
} from "@/app/actions/two-factor";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    Boolean(user.settings?.security?.twoFactorEnabled),
  );
  const [setupData, setSetupData] = useState<{
    qrCodeDataUrl: string;
    secret: string;
  } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isConfirmingSetup, setIsConfirmingSetup] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

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

  const handleStartTwoFactor = async () => {
    setIsStartingSetup(true);
    try {
      const result = await startTwoFactorSetup();
      if (result.error) {
        notifications.show({
          title: "Error",
          message: result.error,
          color: "error",
        });
        return;
      }

      if (!result.qrCodeDataUrl || !result.secret) {
        notifications.show({
          title: "Error",
          message: "2FA setup data is incomplete.",
          color: "error",
        });
        return;
      }

      setSetupData({
        qrCodeDataUrl: result.qrCodeDataUrl,
        secret: result.secret,
      });
      setBackupCodes(null);
      setSetupCode("");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to start 2FA setup.",
        color: "error",
      });
    } finally {
      setIsStartingSetup(false);
    }
  };

  const handleConfirmTwoFactor = async () => {
    setIsConfirmingSetup(true);
    try {
      const result = await confirmTwoFactorSetup(setupCode);
      if (result.error) {
        notifications.show({
          title: "Invalid Code",
          message: result.error,
          color: "error",
        });
        return;
      }

      setTwoFactorEnabled(true);
      setSetupData(null);
      setBackupCodes(result.backupCodes || []);
      setSetupCode("");
      notifications.show({
        title: "2FA Enabled",
        message: "Backup codes generated. Save them securely.",
        color: "success",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to confirm 2FA setup.",
        color: "error",
      });
    } finally {
      setIsConfirmingSetup(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    setIsDisabling(true);
    try {
      const result = await disableTwoFactorWithCode(disableCode);
      if (result.error) {
        notifications.show({
          title: "Error",
          message: result.error,
          color: "error",
        });
        return;
      }

      setTwoFactorEnabled(false);
      setDisableCode("");
      notifications.show({
        title: "2FA Disabled",
        message: "Two-factor authentication has been disabled.",
        color: "success",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to disable 2FA.",
        color: "error",
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const copyBackupCodes = async () => {
    if (!backupCodes?.length) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    notifications.show({
      title: "Copied",
      message: "Backup codes copied to clipboard.",
      color: "success",
    });
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
            <Group gap="xs">
              <Text size="sm" fw={800} c="dimmed">
                CURRENT ROLE:
              </Text>
              <Badge
                color="brand"
                variant="filled"
                className="uppercase tracking-widest text-[10px] shadow-sm shadow-brand-500/10"
              >
                {user.role}
              </Badge>
            </Group>
            {user.department && (
              <Group gap="xs">
                <Text size="sm" fw={800} c="dimmed">
                  DEPARTMENT:
                </Text>
                <span className="text-gray-900 dark:text-white font-black tracking-tight underline decoration-brand-500/30 text-sm">
                  {user.department.name}
                </span>
              </Group>
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
            <Box className="flex-1 min-w-75">
              <Text
                size="xs"
                mb={4}
                fw={800}
                className="uppercase tracking-widest text-gray-500"
              >
                DRAW SIGNATURE
              </Text>
              <Box
                className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden backdrop-blur-sm"
                style={{ height: "150px" }}
              >
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="currentColor"
                  canvasProps={{
                    className: "signature-canvas",
                    style: {
                      width: "100%",
                      height: "100%",
                      color:
                        typeof window !== "undefined" &&
                        document.documentElement.classList.contains("dark")
                          ? "#ffffff"
                          : "#000000",
                    },
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
                <Box className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center min-w-50 backdrop-blur-sm">
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

      <Card withBorder radius="xl" className="premium-card">
        <Stack gap="md">
          <Title order={4} className="text-gray-900 dark:text-white">
            Two-Factor Authentication
          </Title>
          <Text size="sm" className="text-gray-500 font-medium max-w-2xl">
            Protect your account with an authenticator app. Admin accounts must
            enable 2FA to continue accessing the system.
          </Text>

          {!twoFactorEnabled && (
            <Alert color="orange" variant="light">
              Two-factor authentication is not enabled for your account.
            </Alert>
          )}

          {twoFactorEnabled ? (
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                2FA is active for this account.
              </Text>
              <Text size="xs" c="dimmed">
                Disable 2FA using a current authenticator code or a backup code.
              </Text>
              <InputOTP
                maxLength={6}
                value={disableCode}
                onChange={setDisableCode}
                containerClassName="justify-start"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button
                color="red"
                variant="light"
                onClick={handleDisableTwoFactor}
                loading={isDisabling}
                disabled={!disableCode}
              >
                Disable 2FA
              </Button>
            </Stack>
          ) : (
            <Stack gap="md">
              <Button
                color="brand"
                onClick={handleStartTwoFactor}
                loading={isStartingSetup}
              >
                Start 2FA Setup
              </Button>

              {setupData && (
                <Card withBorder radius="lg" className="bg-white/70">
                  <Stack gap="md">
                    <Text size="sm" fw={600}>
                      Scan this QR code with your authenticator app.
                    </Text>
                    <div className="flex justify-center">
                      <img
                        src={setupData.qrCodeDataUrl}
                        alt="2FA QR code"
                        className="w-40 h-40"
                      />
                    </div>
                    <Text size="xs" c="dimmed">
                      Manual setup code: <strong>{setupData.secret}</strong>
                    </Text>

                    <Stack gap={6}>
                      <Text size="xs" fw={700} className="text-gray-500">
                        Enter the 6-digit code
                      </Text>
                      <InputOTP
                        maxLength={6}
                        value={setupCode}
                        onChange={setSetupCode}
                        containerClassName="justify-start"
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </Stack>

                    <Button
                      color="brand"
                      onClick={handleConfirmTwoFactor}
                      loading={isConfirmingSetup}
                      disabled={!setupCode}
                    >
                      Verify and Enable
                    </Button>
                  </Stack>
                </Card>
              )}
            </Stack>
          )}

          {backupCodes && backupCodes.length > 0 && (
            <Card withBorder radius="lg" className="bg-gray-50">
              <Stack gap="xs">
                <Text size="sm" fw={700}>
                  Backup Codes (store these safely)
                </Text>
                <Text size="xs" c="dimmed">
                  Each code can be used once if you lose access to your
                  authenticator app.
                </Text>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
                <Button variant="light" onClick={copyBackupCodes}>
                  Copy Backup Codes
                </Button>
              </Stack>
            </Card>
          )}
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
