"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Show nothing while checking auth, or if unauthenticated
  if (status !== "authenticated") {
    return null;
  }

  // User is authenticated - render content
  return <>{children}</>;
}
