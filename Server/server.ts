import cors from "cors"
import http from "http"
import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import githubAuthRouter from "./Routes/github.auth.route.ts"
import githubProfileRoute from "./Routes/github.profile.route.ts"

dotenv.config()

const PORT = Number(process.env.PORT) || 2606
const app = express()
const server = http.createServer(app)

// --- MIDDLEWARES ---

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`, 
    credentials: true,               
  })
)
app.use(express.json())
app.use(cookieParser())

// Test route to check if the server is running correctly

app.get("/", (req, res) => {
  res.status(200).json({
    name: "GitPulse API",
    status: "running",
    message: "Welcome to GitPulse API"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy"
  });
});

//Routes

app.use('/api', githubAuthRouter)
app.use('/user', githubProfileRoute)

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server...`)

  server.close(async () => {
    console.log("HTTP server closed.")
    try {
      process.exit(0)
    } catch (err) {
      console.error("Error during server closure:", err)
      process.exit(1)
    }
  })

  setTimeout(() => {
    console.error("Forced shutdown after safety timeout.")
    process.exit(1)
  }, 10000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))