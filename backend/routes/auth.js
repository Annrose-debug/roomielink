const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db          = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Helper: sign a 7-day JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ──────────────────────────────────────
   POST /api/auth/register
────────────────────────────────────── */
router.post(
  "/register",
  [
    body("name").notEmpty().trim().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const name     = req.body.name.trim();
    const email    = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();

    try {
      // Check duplicate email
      const [existing] = await db.query(
        "SELECT id FROM users WHERE email = ?", [email]
      );
      if (existing.length > 0)
        return res.status(400).json({ message: "An account with that email already exists" });

      const hash  = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hash]
      );

      const token = signToken(result.insertId);
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: result.insertId, name, email },
      });
    } catch (err) {
      // Catch race-condition duplicate inserts
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Email already registered" });
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ──────────────────────────────────────
   POST /api/auth/login
────────────────────────────────────── */
router.post("/login", async (req, res) => {
  const email    = (req.body.email    || "").trim().toLowerCase();
  const password = (req.body.password || "").trim();

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?", [email]
    );
    if (!users.length)
      return res.status(400).json({ message: "Invalid email or password" });

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Update last active timestamp
    await db.query("UPDATE users SET lastActive = NOW() WHERE id = ?", [user.id]);

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/auth/dashboard  (protected)
   Runs all count queries in parallel with
   Promise.all — much faster than sequential.
────────────────────────────────────── */
router.get("/dashboard", verifyToken, async (req, res) => {
  const uid = req.user.id;

  try {
    // Run 5 queries simultaneously instead of one-by-one
    const [
      [userRows],
      [viewRows],
      [matchRows],
      [msgRows],
      [savedRows],
      [activityRows],
    ] = await Promise.all([
      db.query("SELECT id, name, email, profilePic FROM users WHERE id = ?", [uid]),
      db.query("SELECT COUNT(*) AS count FROM profile_views  WHERE viewedId = ?", [uid]),
      db.query(
        "SELECT COUNT(*) AS count FROM matches WHERE (userA_id = ? OR userB_id = ?) AND status = 'matched'",
        [uid, uid]
      ),
      db.query(
        `SELECT COUNT(*) AS count FROM messages m
         JOIN conversations c ON m.conversationId = c.id
         WHERE (c.participantA = ? OR c.participantB = ?) AND m.senderId != ? AND m.isRead = 0`,
        [uid, uid, uid]
      ),
      db.query(
        "SELECT COUNT(*) AS count FROM saved_listings WHERE userId = ?", [uid]
      ),
      // Last 5 events: new matches + received messages
      db.query(
        `(SELECT 'match' AS type, u.name AS otherName, m.createdAt AS ts
          FROM matches m
          JOIN users u ON u.id = IF(m.userA_id = ?, m.userB_id, m.userA_id)
          WHERE (m.userA_id = ? OR m.userB_id = ?) AND m.status = 'matched'
          ORDER BY m.createdAt DESC LIMIT 3)
         UNION ALL
         (SELECT 'message' AS type, u.name AS otherName, msg.createdAt AS ts
          FROM messages msg
          JOIN conversations c  ON c.id  = msg.conversationId
          JOIN users u ON u.id = IF(c.participantA = ?, c.participantB, c.participantA)
          WHERE (c.participantA = ? OR c.participantB = ?) AND msg.senderId != ?
          ORDER BY msg.createdAt DESC LIMIT 3)
         ORDER BY ts DESC LIMIT 5`,
        [uid, uid, uid, uid, uid, uid, uid]
      ),
    ]);

    if (!userRows.length)
      return res.status(404).json({ message: "User not found" });

    // Shape activity into the format the frontend expects
    const recentActivity = activityRows.map((row) => ({
      title:       row.type === "match" ? "New match! 💕"       : "New message 💬",
      description: row.type === "match"
        ? `You matched with ${row.otherName}`
        : `${row.otherName} sent you a message`,
      time: timeAgo(row.ts),
    }));

    res.json({
      user:          userRows[0],
      profileViews:  viewRows[0].count,
      matches:       matchRows[0].count,
      messages:      msgRows[0].count,
      savedListings: savedRows[0].count,
      recentActivity,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ── Tiny helper: "2 hours ago" style timestamps ── */
function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60)   return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400)return `${Math.floor(secs / 3600)} hr ago`;
  return `${Math.floor(secs / 86400)} days ago`;
}

module.exports = router;