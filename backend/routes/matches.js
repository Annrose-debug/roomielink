const express     = require("express");
const router      = express.Router();
const db          = require("../db");
const verifyToken = require("../middleware/authMiddleware");

/* ──────────────────────────────────────────────────────────
   COMPATIBILITY ALGORITHM
   Scores how well two users match based on their preferences.
   Returns 0–100.

   Scoring breakdown (total 100 pts):
     Smoking       20 pts — exact match
     Pets          20 pts — exact match
     Sleep schedule 20 pts — exact or "flexible" bonus
     Social level  20 pts — exact or adjacent (quiet/moderate)
     Cleanliness   20 pts — sliding scale (abs diff 0=20, 1=15, 2=10, 3=5, 4+=0)
────────────────────────────────────────────────────────── */
function calcScore(a, b) {
  let score = 0;

  // Smoking (20 pts)
  if (a.smoking === b.smoking) score += 20;
  else if (a.smoking === "no" && b.smoking === "outside") score += 10;

  // Pets (20 pts)
  if (a.pets === b.pets) score += 20;
  else if (a.pets === "neutral" || b.pets === "neutral") score += 10;
  else if ((a.pets === "love" && b.pets !== "no") ||
           (b.pets === "love" && a.pets !== "no")) score += 5;

  // Sleep schedule (20 pts)
  if (a.sleepSchedule === b.sleepSchedule) score += 20;
  else if (a.sleepSchedule === "flexible" || b.sleepSchedule === "flexible") score += 15;

  // Social level (20 pts)
  const socialOrder = ["quiet", "moderate", "social"];
  const sDiff = Math.abs(socialOrder.indexOf(a.socialLevel) - socialOrder.indexOf(b.socialLevel));
  if (sDiff === 0) score += 20;
  else if (sDiff === 1) score += 10;

  // Cleanliness (20 pts) — sliding scale based on absolute difference
  const cDiff = Math.abs((a.cleanliness || 3) - (b.cleanliness || 3));
  const cleanPts = [20, 15, 10, 5, 0];
  score += cleanPts[Math.min(cDiff, 4)];

  return score;
}

/* ──────────────────────────────────────
   GET /api/matches/suggestions
   Returns up to 20 users sorted by
   compatibility score, excluding already
   matched/rejected users.
────────────────────────────────────── */
router.get("/suggestions", verifyToken, async (req, res) => {
  const uid = req.user.id;

  try {
    // Get current user's preferences
    const [[meRow]] = await db.query(
      "SELECT smoking, pets, cleanliness, sleepSchedule, socialLevel, location FROM users WHERE id=?",
      [uid]
    );
    if (!meRow) return res.status(404).json({ message: "User not found" });

    // Get IDs already matched/rejected — exclude them
    const [existingMatches] = await db.query(
      "SELECT userA_id, userB_id FROM matches WHERE userA_id=? OR userB_id=?",
      [uid, uid]
    );
    const excludeIds = new Set([uid]);
    existingMatches.forEach((m) => {
      excludeIds.add(m.userA_id);
      excludeIds.add(m.userB_id);
    });

    // Fetch candidate users (same location preferred, limit 100 for scoring)
    const [candidates] = await db.query(
      `SELECT id, name, profilePic, bio, location, budget,
              interests, lifestyle, smoking, pets, cleanliness,
              sleepSchedule, socialLevel
       FROM users
       WHERE id NOT IN (${[...excludeIds].join(",")})
       ORDER BY
         CASE WHEN location = ? THEN 0 ELSE 1 END,
         lastActive DESC
       LIMIT 100`,
      [meRow.location || ""]
    );

    // Score each candidate and sort descending
    const scored = candidates
      .map((u) => ({ ...u, score: calcScore(meRow, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json(scored);
  } catch (err) {
    console.error("Suggestions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   POST /api/matches/like/:userId
   Express interest in another user.
   If they've already liked you back → status = 'matched'
────────────────────────────────────── */
router.post("/like/:userId", verifyToken, async (req, res) => {
  const me    = req.user.id;
  const other = parseInt(req.params.userId, 10);
  if (isNaN(other) || other === me)
    return res.status(400).json({ message: "Invalid user" });

  const [a, b] = me < other ? [me, other] : [other, me];

  try {
    // Check if match row already exists
    const [existing] = await db.query(
      "SELECT * FROM matches WHERE userA_id=? AND userB_id=?", [a, b]
    );

    if (!existing.length) {
      // First like — insert as pending
      await db.query(
        "INSERT INTO matches (userA_id, userB_id, status) VALUES (?,?,'pending')",
        [a, b]
      );
      return res.json({ status: "pending", message: "Like sent! Waiting for them to like back 😊" });
    }

    const match = existing[0];
    // If the other person already liked → it's a match!
    const otherAlreadyLiked =
      (match.status === "pending" && (
        (other === a && me === b) ||  // other is A, me is B means other liked first
        (other === b && me === a)
      ));

    // Simpler: if pending and I'm not the one who initiated, it's mutual
    if (match.status === "pending") {
      await db.query("UPDATE matches SET status='matched' WHERE userA_id=? AND userB_id=?", [a, b]);
      return res.json({ status: "matched", message: "It's a match! 🎉 You can now message each other." });
    }

    if (match.status === "matched")
      return res.json({ status: "matched", message: "Already matched!" });

    res.json({ status: match.status });
  } catch (err) {
    console.error("Like:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   POST /api/matches/reject/:userId
────────────────────────────────────── */
router.post("/reject/:userId", verifyToken, async (req, res) => {
  const me    = req.user.id;
  const other = parseInt(req.params.userId, 10);
  const [a, b] = me < other ? [me, other] : [other, me];

  try {
    await db.query(
      `INSERT INTO matches (userA_id, userB_id, status) VALUES (?,?,'rejected')
       ON DUPLICATE KEY UPDATE status='rejected'`,
      [a, b]
    );
    res.json({ status: "rejected" });
  } catch (err) {
    console.error("Reject:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/matches/mine
   All confirmed matches for current user.
────────────────────────────────────── */
router.get("/mine", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    const [matches] = await db.query(
      `SELECT m.*,
              IF(m.userA_id = ?, u2.id, u1.id)         AS otherId,
              IF(m.userA_id = ?, u2.name, u1.name)      AS otherName,
              IF(m.userA_id = ?, u2.profilePic, u1.profilePic) AS otherPic,
              IF(m.userA_id = ?, u2.bio, u1.bio)         AS otherBio,
              IF(m.userA_id = ?, u2.location, u1.location) AS otherLocation
       FROM matches m
       JOIN users u1 ON u1.id = m.userA_id
       JOIN users u2 ON u2.id = m.userB_id
       WHERE (m.userA_id = ? OR m.userB_id = ?) AND m.status = 'matched'
       ORDER BY m.createdAt DESC`,
      [uid, uid, uid, uid, uid, uid, uid]
    );
    res.json(matches);
  } catch (err) {
    console.error("My matches:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;