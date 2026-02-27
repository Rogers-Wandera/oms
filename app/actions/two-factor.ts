"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import {
  buildOtpAuthUrl,
  decryptText,
  encryptText,
  generateBackupCodes,
  generateTotpSecret,
  isValidTotp,
  normalizeOtpCode,
  verifyWithBackupCodes,
} from "@/lib/security/two-factor";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/actions-utils";

function getSecuritySettings(settings: any) {
  return settings?.security ?? {};
}

async function updateSecuritySettings(userId: string, patch: any) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentSettings = user.settings ?? {};
  const security = getSecuritySettings(currentSettings);

  const newSettings = {
    ...currentSettings,
    security: {
      ...security,
      ...patch,
    },
  };

  await db
    .update(users)
    .set({ settings: newSettings })
    .where(eq(users.id, userId));

  return newSettings;
}

export async function startTwoFactorSetup() {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const secret = generateTotpSecret();
    const otpAuthUrl = buildOtpAuthUrl(session.user.email, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    await updateSecuritySettings(session.user.id, {
      twoFactorMethod: "TOTP",
      twoFactorEnabled: false,
      twoFactorSecret: encryptText(secret),
      twoFactorBackupCodes: [],
      twoFactorSetupDate: null,
    });

    revalidatePath("/dashboard/profile");

    return { secret, otpAuthUrl, qrCodeDataUrl };
  });
}

export async function confirmTwoFactorSetup(code: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return { error: "User not found" };
    }

    const security = getSecuritySettings(user.settings);
    if (!security.twoFactorSecret) {
      return { error: "2FA setup has not been started" };
    }

    const secret = decryptText(security.twoFactorSecret);
    if (!isValidTotp(code, secret)) {
      return { error: "Invalid authentication code" };
    }

    const backupCodes = generateBackupCodes(10);
    const encryptedBackupCodes = backupCodes.map((value) => encryptText(value));

    await updateSecuritySettings(session.user.id, {
      twoFactorEnabled: true,
      twoFactorMethod: "TOTP",
      twoFactorBackupCodes: encryptedBackupCodes,
      twoFactorSetupDate: new Date().toISOString(),
    });

    revalidatePath("/dashboard/profile");

    return { success: true, backupCodes };
  });
}

export async function disableTwoFactorWithCode(code: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return { error: "User not found" };
    }

    const security = getSecuritySettings(user.settings);
    if (!security.twoFactorEnabled || !security.twoFactorSecret) {
      return { error: "Two-factor authentication is not enabled" };
    }

    const secret = decryptText(security.twoFactorSecret);
    const normalized = normalizeOtpCode(code);

    let backupCodesToStore = security.twoFactorBackupCodes ?? [];
    const isTotpValid = isValidTotp(normalized, secret);

    if (!isTotpValid) {
      const backupResult = verifyWithBackupCodes(
        normalized,
        backupCodesToStore ?? [],
      );

      if (!backupResult.valid) {
        return { error: "Invalid authentication code" };
      }

      backupCodesToStore = backupResult.remaining;
    }

    await updateSecuritySettings(session.user.id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      twoFactorSetupDate: null,
    });

    revalidatePath("/dashboard/profile");

    return { success: true };
  });
}

export async function disableTwoFactorForUser(userId: string) {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    await updateSecuritySettings(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      twoFactorSetupDate: null,
    });

    revalidatePath("/admin/users");

    return { success: true };
  });
}
