import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./db";
import demosRouter from "./routes/demos";

// Try loading .env from multiple locations (handles different CWDs on Windows)
const envPaths = [
  path.resolve(__dirname, "../../.env"), // running from server/src
  path.resolve(__dirname, "../.env"), // running from server/dist
  path.resolve(process.cwd(), ".env"), // running from project root
  path.resolve(process.cwd(), "../.env"), // running from server/
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.warn("⚠️  MONGODB_URI not found in any .env location. Tried:");
  envPaths.forEach((p) => console.warn("   -", p));
}

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = "https://demo-projecte.netlify.app/";
// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://demo-projecte.netlify.app/"],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/demos", demosRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint - shows DB name + collection count
app.get("/api/debug", async (req, res) => {
  try {
    const { getDB } = await import("./db");
    const db = await getDB();
    const collections = await db.listCollections().toArray();
    const demoCount = await db.collection("demos").countDocuments();
    const sampleDemos = await db
      .collection("demos")
      .find({}, { projection: { slug: 1, businessName: 1, _id: 0 } })
      .limit(5)
      .toArray();
    res.json({
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      demoCount,
      sampleDemos,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
