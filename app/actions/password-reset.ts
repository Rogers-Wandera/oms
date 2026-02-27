"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { logAuthEvent } from "./auth-audit";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Setup nodemailer (using env variables provided by user)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function requestPasswordReset(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    // SECURITY: Don't leak user existence
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await db
    .update(users)
    .set({
      resetToken: token,
      resetTokenExpires: expires,
    })
    .where(eq(users.id, user.id));

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request - OMS",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2>Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>We received a request to reset your password. Click the button below to continue:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #228be6; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  await logAuthEvent({
    userId: user.id,
    type: "PASSWORD_RESET_REQUEST",
    message: "Password reset link sent to email.",
  });

  return { success: true };
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.resetToken, token),
      gt(users.resetTokenExpires, new Date()),
    ),
  });

  if (!user) {
    return { success: false, error: "Invalid or expired token" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      isLocked: false,
      loginAttempts: 0,
    })
    .where(eq(users.id, user.id));

  await logAuthEvent({
    userId: user.id,
    type: "PASSWORD_RESET_SUCCESS",
    message: "Password reset successfully confirmed.",
  });

  return { success: true };
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: '"OMS System" <noreply@oms.com>',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
