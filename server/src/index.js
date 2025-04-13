import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bug-tracker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("leave-project", (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/issues", issueRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

const startServer = async (port) => {
  try {
    await new Promise((resolve, reject) => {
      const server = httpServer
        .listen(port)
        .once("listening", () => {
          console.log(`Server running on port ${port}`);
          resolve();
        })
        .once("error", (err) => {
          server.removeAllListeners();
          if (err.code === "EADDRINUSE" && port < PORT + MAX_PORT_ATTEMPTS) {
            console.log(`Port ${port} is in use, trying port ${port + 1}`);
            resolve(startServer(port + 1));
          } else {
            reject(err);
          }
        });
    });
  } catch (err) {
    console.error("Server error:", err);
    process.exit(1);
  }
};

startServer(PORT).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
