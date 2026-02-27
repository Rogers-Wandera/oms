"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Loader2, Send } from "lucide-react";
import { checkIn, checkOut } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";
import { ExtensionRequestModal } from "./extension-request-modal";
import { useLocation } from "./location-guard";

interface AttendanceCardProps {
  attendance: {
    id: string;
    check_in: string;
    check_out: string | null;
  } | null;
  userId: string;
  role?: string;
}

export function AttendanceCard({
  attendance,
  userId,
  role,
}: AttendanceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [extensionOpened, setExtensionOpened] = useState(false);
  const router = useRouter();
  const { location } = useLocation();

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await checkIn(userId, location || undefined);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      if (attendance?.id) {
        await checkOut(attendance.id, location || undefined);
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasCheckedIn = !!attendance;
  const hasCheckedOut = !!attendance?.check_out;

  return (
    <>
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl tracking-tight text-gray-900 dark:text-white">
            <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 shadow-sm shadow-brand-500/10 transition-all group-hover:bg-brand-500/25">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            Today&apos;s Attendance
          </CardTitle>
          <CardDescription className="opacity-70 text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group relative p-4 rounded-xl bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 hover:border-brand-500/30 transition-all">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {hasCheckedIn ? formatTime(attendance.check_in) : "--:--"}
                </p>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-500/50 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="group relative p-4 rounded-xl bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5 hover:border-brand-500/30 transition-all">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </p>
                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                  {hasCheckedOut ? formatTime(attendance.check_out!) : "--:--"}
                </p>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500/50 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex sm:flex-col gap-3 min-w-[140px]">
              {!hasCheckedIn ? (
                <Button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Check In
                </Button>
              ) : !hasCheckedOut ? (
                <>
                  <Button
                    onClick={handleCheckOut}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-2" />
                    )}
                    Check Out
                  </Button>
                  {role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-500/10"
                      onClick={() => setExtensionOpened(true)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Request Extension
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center p-3 rounded-xl bg-brand-500/15 border border-brand-500/30 shadow-sm shadow-brand-500/5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest">
                  Attendance Complete
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ExtensionRequestModal
        opened={extensionOpened}
        onClose={() => setExtensionOpened(false)}
        userId={userId}
      />
    </>
  );
}
