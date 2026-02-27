export async function broadcastEvent(event: string, data: any) {
  try {
    const url =
      process.env.NEXT_PUBLIC_SOCKET_URL?.replace(":3001", "") ||
      "http://localhost:3001";
    // We target the internal port directly
    await fetch(`http://localhost:3001/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    });
  } catch (error) {
    console.error("Failed to broadcast event:", error);
  }
}
