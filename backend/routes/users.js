const express     = require("express");
const router      = express.Router();
const multer      = require("multer");
const path        = require("path");
const fs          = require("fs");
const db          = require("../db");
const verifyToken = require("../middleware/authMiddleware");

/* ── Uploads dir ─────────────────────── */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ── Multer config ───────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req,  file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(
      path.extname(file.originalname).toLowerCase()
    );
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

/* ── Delete old pic from disk (silent) ─ */
const deletePic = (picPath) => {
  if (!picPath || picPath === "") return;
  const full = path.join(__dirname, "..", picPath);
  fs.unlink(full, (err) => {
    if (err && err.code !== "ENOENT")
      console.error("Could not delete old pic:", err.message);
  });
};

/* ──────────────────────────────────────
   GET /api/users/profile  (private)
────────────────────────────────────── */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, profilePic, bio, location, budget,
              DATE_FORMAT(moveInDate,'%Y-%m-%d') AS moveInDate,
              interests, lifestyle,
              smoking, pets, cleanliness, sleepSchedule, socialLevel, createdAt
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    // Log a profile view if not viewing your own (self-visits don't count)
    // This is a fire-and-forget — don't await it
    res.json(rows[0]);
  } catch (err) {
    console.error("GET profile:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ──────────────────────────────────────
   GET /api/users/profile/:userId  (public)
   Also logs a profile view.
────────────────────────────────────── */
router.get("/profile/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

  try {
    const [rows] = await db.query(
      `SELECT id, name, profilePic, bio, location, budget,
              interests, lifestyle, smoking, pets, cleanliness,
              sleepSchedule, socialLevel, createdAt
       FROM users WHERE id = ?`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Profile not found" });

    // Log view (viewer unknown here — pass viewerId if you have auth header)
    db.query(
      "INSERT INTO profile_views (viewedId) VALUES (?)", [userId]
    ).catch(() => {}); // never crash on analytics failure

    res.json(rows[0]);
  } catch (err) {
    console.error("GET public profile:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ──────────────────────────────────────
   GET /api/users/search  (browse roommates)
   Query params: location, sleepSchedule,
   smoking, pets, socialLevel, page
────────────────────────────────────── */
router.get("/search", verifyToken, async (req, res) => {
  const { location, sleepSchedule, smoking, pets, socialLevel, page = 1 } = req.query;
  const limit  = 12;
  const offset = (parseInt(page) - 1) * limit;

  // Build dynamic WHERE clause — only filter on params that were sent
  const conditions = ["u.id != ?"];   // exclude self
  const params     = [req.user.id];

  if (location)      { conditions.push("u.location LIKE ?");      params.push(`%${location}%`); }
  if (sleepSchedule) { conditions.push("u.sleepSchedule = ?");    params.push(sleepSchedule); }
  if (smoking)       { conditions.push("u.smoking = ?");          params.push(smoking); }
  if (pets)          { conditions.push("u.pets = ?");             params.push(pets); }
  if (socialLevel)   { conditions.push("u.socialLevel = ?");      params.push(socialLevel); }

  const where = conditions.join(" AND ");

  try {
    const [[{ total }], [users]] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM users u WHERE ${where}`, params),
      db.query(
        `SELECT id, name, profilePic, bio, location, budget,
                interests, lifestyle, smoking, pets, cleanliness,
                sleepSchedule, socialLevel, lastActive
         FROM users u
         WHERE ${where}
         ORDER BY lastActive DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
    ]);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   PUT /api/users/profile  (private)
────────────────────────────────────── */
router.put("/profile", verifyToken, async (req, res) => {
  const { name, bio, location, budget, moveInDate, interests, lifestyle } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Name is required" });

  try {
    await db.query(
      `UPDATE users SET name=?, bio=?, location=?, budget=?,
                        moveInDate=?, interests=?, lifestyle=?
       WHERE id=?`,
      [name.trim(), bio||"", location||"", budget||"",
       moveInDate||null, interests||"", lifestyle||"", req.user.id]
    );

    const [rows] = await db.query(
      `SELECT id, name, email, profilePic, bio, location, budget,
              DATE_FORMAT(moveInDate,'%Y-%m-%d') AS moveInDate,
              interests, lifestyle
       FROM users WHERE id=?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

/* ──────────────────────────────────────
   POST /api/users/profile/picture  (private)
────────────────────────────────────── */
router.post("/profile/picture", verifyToken, upload.single("profilePic"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const newUrl = `/uploads/${req.file.filename}`;

  try {
    const [rows] = await db.query(
      "SELECT profilePic FROM users WHERE id=?", [req.user.id]
    );
    const oldPic = rows[0]?.profilePic;

    await db.query("UPDATE users SET profilePic=? WHERE id=?", [newUrl, req.user.id]);

    deletePic(oldPic); // delete after successful DB update

    res.json({ profilePic: newUrl });
  } catch (err) {
    console.error("Pic upload:", err);
    deletePic(newUrl); // cleanup the just-uploaded file
    res.status(500).json({ message: "Error updating profile picture" });
  }
});

/* ──────────────────────────────────────
   GET /api/users/preferences
────────────────────────────────────── */
router.get("/preferences", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT smoking, pets, cleanliness, sleepSchedule, socialLevel FROM users WHERE id=?",
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error("GET prefs:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* ──────────────────────────────────────
   PUT /api/users/preferences
────────────────────────────────────── */
router.put("/preferences", verifyToken, async (req, res) => {
  const { smoking, pets, cleanliness, sleepSchedule, socialLevel } = req.body;

  const clean = parseInt(cleanliness, 10);
  if (isNaN(clean) || clean < 1 || clean > 5)
    return res.status(400).json({ message: "Cleanliness must be 1–5" });

  try {
    await db.query(
      "UPDATE users SET smoking=?, pets=?, cleanliness=?, sleepSchedule=?, socialLevel=? WHERE id=?",
      [smoking, pets, clean, sleepSchedule, socialLevel, req.user.id]
    );
    res.json({ smoking, pets, cleanliness: clean, sleepSchedule, socialLevel });
  } catch (err) {
    console.error("PUT prefs:", err);
    res.status(500).json({ message: "Error updating preferences" });
  }
});

module.exports = router;