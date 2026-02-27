import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, userSessions, departments } from "@/lib/db/schema";
import { eq, and, sql, desc, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logAuthEvent } from "@/app/actions/auth-audit";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS = 3;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const userResults = await db
          .select({
            user: users,
            departmentName: departments.name,
          })
          .from(users)
          .leftJoin(departments, eq(users.departmentId, departments.id))
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (userResults.length === 0) {
          throw new Error("Invalid email or password");
        }

        const { user } = userResults[0];

        // 1. Check if locked
        if (user.isLocked) {
          const now = new Date();
          if (user.lockedUntil && user.lockedUntil > now) {
            const minutesLeft = Math.ceil(
              (user.lockedUntil.getTime() - now.getTime()) / 60000,
            );
            await logAuthEvent({
              userId: user.id,
              type: "LOGIN_FAILURE",
              message: `Blocked login attempt: Account locked. ${minutesLeft} mins remaining.`,
            });
            throw new Error(
              `Account locked. Try again in ${minutesLeft} minutes.`,
            );
          } else {
            // Auto-unlock
            await db
              .update(users)
              .set({ isLocked: false, lockedUntil: null, loginAttempts: 0 })
              .where(eq(users.id, user.id));
          }
        }

        // 2. Validate password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValidPassword) {
          const newAttempts = user.loginAttempts + 1;
          const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            await db
              .update(users)
              .set({
                isLocked: true,
                lockedUntil: new Date(Date.now() + LOCK_TIME_MS),
                loginAttempts: newAttempts,
              })
              .where(eq(users.id, user.id));

            await logAuthEvent({
              userId: user.id,
              type: "USER_LOCK",
              message:
                "Account locked due to consecutive failed login attempts.",
            });

            throw new Error(
              "Too many failed attempts. Account locked for 30 minutes.",
            );
          } else {
            await db
              .update(users)
              .set({ loginAttempts: newAttempts })
              .where(eq(users.id, user.id));

            await logAuthEvent({
              userId: user.id,
              type: "LOGIN_FAILURE",
              message: `Invalid password. ${remaining} attempts remaining.`,
            });

            throw new Error(
              `Invalid credentials. ${remaining} attempts remaining.`,
            );
          }
        }

        // 3. Success: Reset attempts and update last login
        await db
          .update(users)
          .set({
            loginAttempts: 0,
            lastLoginDate: new Date(),
            isLocked: false,
            lockedUntil: null,
            isOnline: true,
            lastActive: new Date(),
          })
          .where(eq(users.id, user.id));

        await logAuthEvent({
          userId: user.id,
          type: "LOGIN_SUCCESS",
          message: "Secure login successful.",
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          departmentId: user.departmentId,
          departmentName: userResults[0].departmentName,
          supervisorId: user.supervisorId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) return false;

      // Session Limit Management
      const activeSessions = await db
        .select({ value: count() })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, user.id),
            eq(userSessions.isActive, true),
          ),
        );

      if (activeSessions[0].value >= MAX_SESSIONS) {
        // Find and deactivate the oldest session to make room
        const oldestSession = await db
          .select({ id: userSessions.id })
          .from(userSessions)
          .where(
            and(
              eq(userSessions.userId, user.id),
              eq(userSessions.isActive, true),
            ),
          )
          .orderBy(desc(userSessions.creationDate)) // creationDate is in auditFields
          .offset(MAX_SESSIONS - 1)
          .limit(1);

        if (oldestSession.length > 0) {
          await db
            .update(userSessions)
            .set({ isActive: false })
            .where(eq(userSessions.id, oldestSession[0].id));
        }
      }

      // Create new session record
      await db.insert(userSessions).values({
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.departmentName = user.departmentName;
        token.supervisorId = user.supervisorId;
        token.isLocked = (user as any).isLocked;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as string | null;
        session.user.departmentName = token.departmentName as string | null;
        session.user.supervisorId = token.supervisorId as string | null;
        (session.user as any).isLocked = token.isLocked as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
