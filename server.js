const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store user socket connections
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room when user connects with their user ID
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined room: user_${userId}`);
      }
    });

    // Join contract room for real-time chat
    socket.on("join_contract", (contractId) => {
      socket.join(`contract_${contractId}`);
      console.log(`Socket ${socket.id} joined contract room: contract_${contractId}`);
    });

    // Leave contract room
    socket.on("leave_contract", (contractId) => {
      socket.leave(`contract_${contractId}`);
      console.log(`Socket ${socket.id} left contract room: contract_${contractId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { contractId, senderId, receiverId, message } = data;

        // Emit to the contract room
        io.to(`contract_${contractId}`).emit("receive_message", {
          contractId,
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });

        // Also notify the receiver if they're online
        io.to(`user_${receiverId}`).emit("new_message_notification", {
          contractId,
          senderId,
          message: message.substring(0, 50), // Preview
        });
      } catch (error) {
        console.error("Error handling send_message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { contractId, userId, isTyping } = data;
      socket.to(`contract_${contractId}`).emit("user_typing", {
        userId,
        isTyping,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
