const express     = require("express");
const router      = express.Router();
const db          = require("../db");
const verifyToken = require("../middleware/authMiddleware");

/* ──────────────────────────────────────
   GET /api/messages/conversations
   Returns all conversations for current user,
   with the other participant's info + last message.
────────────────────────────────────── */
router.get("/conversations", verifyToken, async (req, res) => {
  const uid = req.user.id;
  try {
    const [convs] = await db.query(
      `SELECT c.*,
              IF(c.participantA = ?, u2.id, u1.id)         AS otherId,
              IF(c.participantA = ?, u2.name, u1.name)      AS otherName,
              IF(c.participantA = ?, u2.profilePic, u1.profilePic) AS otherPic,
              (SELECT COUNT(*) FROM messages m
               WHERE m.conversationId = c.id
                 AND m.senderId != ? AND m.isRead = 0)      AS unread
       FROM conversations c
       JOIN users u1 ON u1.id = c.participantA
       JOIN users u2 ON u2.id = c.participantB
       WHERE c.participantA = ? OR c.participantB = ?
       ORDER BY c.lastAt DESC`,
      [uid, uid, uid, uid, uid, uid]
    );
    res.json(convs);
  } catch (err) {
    console.error("GET conversations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/messages/conversation/:userId
   Get or create a conversation with another user,
   then return the messages in it.
────────────────────────────────────── */
router.get("/conversation/:userId", verifyToken, async (req, res) => {
  const me    = req.user.id;
  const other = parseInt(req.params.userId, 10);
  if (isNaN(other) || other === me)
    return res.status(400).json({ message: "Invalid user" });

  // Enforce: participantA is always the smaller ID (prevents duplicate rows)
  const [a, b] = me < other ? [me, other] : [other, me];

  try {
    // Find or create conversation
    let [convRows] = await db.query(
      "SELECT id FROM conversations WHERE participantA=? AND participantB=?", [a, b]
    );

    let convId;
    if (!convRows.length) {
      const [result] = await db.query(
        "INSERT INTO conversations (participantA, participantB) VALUES (?,?)", [a, b]
      );
      convId = result.insertId;
    } else {
      convId = convRows[0].id;
    }

    // Fetch messages
    const [messages] = await db.query(
      `SELECT m.*, u.name AS senderName, u.profilePic AS senderPic
       FROM messages m
       JOIN users u ON u.id = m.senderId
       WHERE m.conversationId = ?
       ORDER BY m.createdAt ASC`,
      [convId]
    );

    // Mark messages from the other user as read
    await db.query(
      "UPDATE messages SET isRead=1 WHERE conversationId=? AND senderId!=?",
      [convId, me]
    );

    res.json({ conversationId: convId, messages });
  } catch (err) {
    console.error("GET conversation:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   POST /api/messages/send
   Body: { toUserId, body }
────────────────────────────────────── */
router.post("/send", verifyToken, async (req, res) => {
  const me   = req.user.id;
  const { toUserId, body: msgBody } = req.body;
  const other = parseInt(toUserId, 10);

  if (!msgBody?.trim())            return res.status(400).json({ message: "Message cannot be empty" });
  if (isNaN(other) || other === me) return res.status(400).json({ message: "Invalid recipient" });

  const [a, b] = me < other ? [me, other] : [other, me];

  try {
    // Ensure conversation exists
    let [convRows] = await db.query(
      "SELECT id FROM conversations WHERE participantA=? AND participantB=?", [a, b]
    );
    let convId;
    if (!convRows.length) {
      const [r] = await db.query(
        "INSERT INTO conversations (participantA, participantB) VALUES (?,?)", [a, b]
      );
      convId = r.insertId;
    } else {
      convId = convRows[0].id;
    }

    // Insert message
    const [msgResult] = await db.query(
      "INSERT INTO messages (conversationId, senderId, body) VALUES (?,?,?)",
      [convId, me, msgBody.trim()]
    );

    // Update conversation's lastMessage preview + timestamp
    await db.query(
      "UPDATE conversations SET lastMessage=?, lastAt=NOW() WHERE id=?",
      [msgBody.trim().slice(0, 100), convId]
    );

    res.status(201).json({
      id:             msgResult.insertId,
      conversationId: convId,
      senderId:       me,
      body:           msgBody.trim(),
      isRead:         false,
      createdAt:      new Date(),
    });
  } catch (err) {
    console.error("POST message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/messages/unread-count
────────────────────────────────────── */
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM messages m
       JOIN conversations c ON c.id = m.conversationId
       WHERE (c.participantA=? OR c.participantB=?)
         AND m.senderId != ? AND m.isRead = 0`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json({ count });
  } catch (err) {
    console.error("Unread count:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;