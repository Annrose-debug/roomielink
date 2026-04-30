require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const path      = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes    = require("./routes/auth");
const userRoutes    = require("./routes/users");
const listingRoutes = require("./routes/listings");
const messageRoutes = require("./routes/messages");
const matchRoutes   = require("./routes/matches");
const contactRoutes = require("./routes/contact");

const app = express();

/* ── CORS ─────────────────────────────── */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://roomielink.vercel.app",
  "https://roomielink.onrender.com",
];

// REMOVE the problematic line - don't use app.options('*', cors())
// Just use cors middleware normally
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin) return cb(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    console.log(`❌ Blocked CORS request from: ${origin}`);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Timeout (fixes slow loading) ────── */
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    console.error(`⏱ Timeout: ${req.method} ${req.path}`);
    if (!res.headersSent)
      res.status(503).json({ message: "Request timed out — please try again" });
  });
  next();
});

app.use(express.json({ limit: "10kb" }));

/* ── Static uploads ───────────────────── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── Rate limiters ───────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { message: "Too many attempts — wait a few minutes" },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true, legacyHeaders: false,
});

/* ── Health check ────────────────────── */
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

/* ── Routes ──────────────────────────── */
app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/users",    apiLimiter,  userRoutes);
app.use("/api/listings", apiLimiter,  listingRoutes);
app.use("/api/messages", apiLimiter,  messageRoutes);
app.use("/api/matches",  apiLimiter,  matchRoutes);
app.use("/api/contact",  apiLimiter,  contactRoutes);

app.get("/", (_req, res) => res.send("RoomieLink API 🏠"));

/* ── Global error handler ────────────── */
app.use((err, _req, res, _next) => {
  console.error("Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE")         return res.status(413).json({ message: "File too large — max 5 MB" });
  if (err.message?.startsWith("Only image"))  return res.status(415).json({ message: err.message });
  if (err.message?.startsWith("CORS"))        return res.status(403).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));