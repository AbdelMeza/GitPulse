import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import express from "express";
import githubAuthRouter from "./Routes/github.auth.route.ts"

dotenv.config();

const PORT: string | number = process.env.PORT || 5135;
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`, 
    credentials: true,               
  })
);
app.use(express.json());

//Routes
app.use('/api', githubAuthRouter);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server...`);

  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      process.exit(0);
    } catch (err) {
      console.error("Error during server closure:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown after safety timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));