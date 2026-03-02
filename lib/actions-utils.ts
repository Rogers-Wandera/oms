import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Wraps a server action to prevent sensitive error leakage (like SQL strings)
 * to the frontend in production.
 */
export async function safeAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    // If it's a Next.js redirect, we MUST re-throw it so the router can handle it
    if (typeof isRedirectError === "function" && isRedirectError(error)) {
      throw error;
    }

    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    // Log the full error on the server for debugging
    console.error("[SERVER_ACTION_ERROR]:", error);

    // In development, we want the full error for debugging
    if (process.env.NODE_ENV === "development") {
      throw error;
    }

    throw new Error("An unexpected error occurred. Please try again later.");
  }
}
