import { createServer } from "http";
import { Server } from "socket.io";
import { decode } from "next-auth/jwt";
import * as dotenv from "dotenv";

import { setupCronJobs } from "./cron-jobs";

dotenv.config();

const port = 3701;
const httpServer = createServer((req, res) => {
  // Simple internal broadcast API
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { event, data } = JSON.parse(body);
        io.emit(event, data);
        res.writeHead(200);
        res.end("OK");
      } catch (e) {
        res.writeHead(400);
        res.end("Error");
      }
    });
    return;
  }
  res.writeHead(404);
  res.end();
});
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3201",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map<string, string>(); // userId -> socketId

io.use(async (socket, next) => {
  const cookieHeader = socket.request.headers.cookie;
  if (!cookieHeader) {
    return next(new Error("Authentication error: No cookies found"));
  }

  // Find oms-next-auth.session-token in cookies
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("=")),
  );

  const token = cookies["oms-next-auth.session-token"];

  if (!token) {
    return next(new Error("Authentication error: Session token not found"));
  }

  try {
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (decoded) {
      (socket as any).userId = decoded.id;
      next();
    } else {
      next(new Error("Authentication error: Invalid token"));
    }
  } catch (err) {
    next(new Error("Authentication error: " + (err as Error).message));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId;
  if (!userId) return;

  console.log(`User connected: ${userId} (${socket.id})`);
  onlineUsers.set(userId, socket.id);

  // Broadcast updated list to everyone
  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    onlineUsers.delete(userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${port}`);
  setupCronJobs(io);
});
