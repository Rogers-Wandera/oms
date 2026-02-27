"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Container,
  Center,
  Stack,
  Title,
  Text,
  Button,
  Box,
  Overlay,
  Paper,
  Group,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { MapPin, Navigation, ShieldAlert, Loader2 } from "lucide-react";

interface LocationContextType {
  location: { lat: string; long: string } | null;
  error: string | null;
  isAccessing: boolean;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  error: null,
  isAccessing: true,
});

export const useLocation = () => useContext(LocationContext);

export function LocationGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<{
    lat: string;
    long: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccessing, setIsAccessing] = useState(true);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState | null>(null);

  const getLocation = (force = false) => {
    setIsAccessing(true);
    setError(null);

    // Check session storage first if not forcing
    if (!force) {
      const stored = sessionStorage.getItem("oms_location_verified");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.lat && parsed.long) {
            setLocation(parsed);
            setIsAccessing(false);
            return;
          }
        } catch (e) {}
      }
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsAccessing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude.toString(),
          long: position.coords.longitude.toString(),
        };
        setLocation(newLoc);
        sessionStorage.setItem("oms_location_verified", JSON.stringify(newLoc));
        setError(null);
        setIsAccessing(false);
      },
      (err) => {
        let msg = "Please enable location services to continue.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location access was denied. Please enable it in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Request to get user location timed out.";
        }
        setError(msg);
        setIsAccessing(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    getLocation();

    // Monitor permission status changes if possible
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as any })
        .then((status) => {
          setPermissionStatus(status.state);
          status.onchange = () => {
            setPermissionStatus(status.state);
            if (status.state === "granted") {
              getLocation(true);
            } else if (status.state === "denied") {
              setLocation(null);
              sessionStorage.removeItem("oms_location_verified");
            }
          };
        });
    }
  }, []);

  if (location) {
    return (
      <LocationContext.Provider value={{ location, error, isAccessing }}>
        {children}
      </LocationContext.Provider>
    );
  }

  return (
    <LocationContext.Provider value={{ location, error, isAccessing }}>
      <Box pos="relative" h="100vh" w="100vw" style={{ overflow: "hidden" }}>
        <Overlay
          color="#000"
          backgroundOpacity={0.85}
          blur={15}
          center
          style={{ zIndex: 1000 }}
        >
          <Container size="sm">
            <Paper
              p={40}
              radius="xl"
              withBorder
              className="glass-card"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Stack gap="xl" align="center" style={{ textAlign: "center" }}>
                <Box
                  style={{
                    position: "relative",
                    width: rem(100),
                    height: rem(100),
                  }}
                >
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "var(--mantine-color-brand-filled)",
                      borderRadius: "50%",
                      opacity: 0.15,
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }}
                  />
                  <Center h="100%">
                    <ThemeIcon
                      size={rem(70)}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: "brand", to: "cyan" }}
                    >
                      {isAccessing ? (
                        <Loader2 className="animate-spin" size={35} />
                      ) : (
                        <MapPin size={35} />
                      )}
                    </ThemeIcon>
                  </Center>
                </Box>

                <div>
                  <Title
                    order={1}
                    style={{
                      fontSize: rem(32),
                      color: "#fff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Location Access Required
                  </Title>
                  <Text
                    c="dimmed"
                    mt="md"
                    style={{
                      fontSize: rem(18),
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    To ensure system security and accurate attendance tracking,
                    please enable location services for this application.
                  </Text>
                </div>

                {error && (
                  <Paper
                    p="md"
                    radius="md"
                    bg="rgba(250, 82, 82, 0.05)"
                    style={{
                      border: "1px solid rgba(250, 82, 82, 0.2)",
                      width: "100%",
                    }}
                  >
                    <Group gap="sm" wrap="nowrap">
                      <ShieldAlert
                        color="var(--mantine-color-red-6)"
                        size={20}
                      />
                      <Text
                        c="red"
                        size="sm"
                        fw={500}
                        style={{ textAlign: "left" }}
                      >
                        {error}
                      </Text>
                    </Group>
                  </Paper>
                )}

                <Stack w="100%" gap="md">
                  <Button
                    size="lg"
                    radius="md"
                    color="brand"
                    leftSection={<Navigation size={18} />}
                    onClick={() => getLocation(true)}
                    loading={isAccessing}
                    fullWidth
                    style={{
                      height: rem(54),
                      fontSize: rem(16),
                      boxShadow:
                        "0 10px 15px -3px rgba(var(--brand-color-rgb), 0.3)",
                    }}
                  >
                    Enable Location Services
                  </Button>

                  {!isAccessing && (
                    <Text
                      size="xs"
                      c="dimmed"
                      style={{ color: "rgba(255, 255, 255, 0.4)" }}
                    >
                      If the prompt doesn&apos;t appear, check your browser
                      settings and try again.
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Container>
        </Overlay>

        <style jsx global>{`
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.15;
            }
            50% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          .glass-card {
            transition: all 0.3s ease;
          }
        `}</style>
      </Box>
    </LocationContext.Provider>
  );
}
