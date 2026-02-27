import { isRedirectError } from "next/dist/client/components/redirect";

/**
 * Wraps a server action to prevent sensitive error leakage (like SQL strings)
 * to the frontend in production.
 */
export async function safeAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    // If it's a Next.js redirect, we MUST re-throw it so the router can handle it
    if (isRedirectError(error)) {
      throw error;
    }

    // Log the full error on the server for debugging
    console.error("[SERVER_ACTION_ERROR]:", error);

    // In development, we want the full error for debugging
    if (process.env.NODE_ENV === "development") {
      throw error;
    }

    // In production, return a generic message
    // If the error already has a 'friendly' status or is a known business error,
    // we could potentially pass it through, but to be safe against SQL leakage,
    // we use a generic one unless we implement a specific Error class.
    throw new Error("An unexpected error occurred. Please try again later.");
  }
}
