const express     = require("express");
const router      = express.Router();
const multer      = require("multer");
const path        = require("path");
const fs          = require("fs");
const db          = require("../db");
const verifyToken = require("../middleware/authMiddleware");

/* ── Image upload setup (up to 5 images per listing) ── */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req,  file, cb) =>
    cb(null, `listing-${Date.now()}-${Math.round(Math.random()*1e6)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error("Only image files allowed"));
  },
});

/* ──────────────────────────────────────
   GET /api/listings
   Browse with filters + pagination.
   Query: location, minPrice, maxPrice,
          bedrooms, furnished, petsAllowed, page
────────────────────────────────────── */
router.get("/", async (req, res) => {
  const {
    location, minPrice, maxPrice,
    bedrooms, furnished, petsAllowed, page = 1,
  } = req.query;

  const limit  = 12;
  const offset = (parseInt(page) - 1) * limit;

  const conds  = ["l.isActive = 1"];
  const params = [];

  if (location)   { conds.push("l.location LIKE ?");  params.push(`%${location}%`); }
  if (minPrice)   { conds.push("l.price >= ?");        params.push(parseFloat(minPrice)); }
  if (maxPrice)   { conds.push("l.price <= ?");        params.push(parseFloat(maxPrice)); }
  if (bedrooms)   { conds.push("l.bedrooms = ?");      params.push(parseInt(bedrooms)); }
  if (furnished !== undefined && furnished !== "")
                  { conds.push("l.furnished = ?");     params.push(furnished === "true" ? 1 : 0); }
  if (petsAllowed !== undefined && petsAllowed !== "")
                  { conds.push("l.petsAllowed = ?");   params.push(petsAllowed === "true" ? 1 : 0); }

  const where = conds.join(" AND ");

  try {
    const [[{ total }], [listings]] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM listings l WHERE ${where}`, params),
      db.query(
        `SELECT l.*, u.name AS ownerName, u.profilePic AS ownerPic
         FROM listings l
         JOIN users u ON u.id = l.userId
         WHERE ${where}
         ORDER BY l.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
    ]);

    res.json({ listings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET listings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/listings/:id  (single listing)
────────────────────────────────────── */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid listing ID" });

  try {
    const [rows] = await db.query(
      `SELECT l.*, u.name AS ownerName, u.email AS ownerEmail,
              u.profilePic AS ownerPic, u.bio AS ownerBio
       FROM listings l
       JOIN users u ON u.id = l.userId
       WHERE l.id = ? AND l.isActive = 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Listing not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   POST /api/listings  (create)
────────────────────────────────────── */
router.post("/", verifyToken, upload.array("images", 5), async (req, res) => {
  const {
    title, description, price, location, address,
    bedrooms, bathrooms, furnished, petsAllowed, smokingOk, availableFrom,
  } = req.body;

  if (!title || !price || !location)
    return res.status(400).json({ message: "Title, price, and location are required" });

  // Collect uploaded image paths
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

  try {
    const [result] = await db.query(
      `INSERT INTO listings
         (userId, title, description, price, location, address,
          bedrooms, bathrooms, furnished, petsAllowed, smokingOk,
          availableFrom, images)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        title, description || "",
        parseFloat(price), location, address || "",
        parseInt(bedrooms) || 1, parseInt(bathrooms) || 1,
        furnished === "true" ? 1 : 0,
        petsAllowed === "true" ? 1 : 0,
        smokingOk === "true" ? 1 : 0,
        availableFrom || null,
        JSON.stringify(images),
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Listing created!" });
  } catch (err) {
    console.error("POST listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   PUT /api/listings/:id  (update — owner only)
────────────────────────────────────── */
router.put("/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    const [rows] = await db.query("SELECT userId FROM listings WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Listing not found" });
    if (rows[0].userId !== req.user.id)
      return res.status(403).json({ message: "Not your listing" });

    const {
      title, description, price, location, address,
      bedrooms, bathrooms, furnished, petsAllowed, smokingOk, availableFrom,
    } = req.body;

    await db.query(
      `UPDATE listings SET title=?, description=?, price=?, location=?, address=?,
                           bedrooms=?, bathrooms=?, furnished=?, petsAllowed=?,
                           smokingOk=?, availableFrom=?
       WHERE id=?`,
      [title, description, parseFloat(price), location, address,
       parseInt(bedrooms)||1, parseInt(bathrooms)||1,
       furnished?1:0, petsAllowed?1:0, smokingOk?1:0,
       availableFrom||null, id]
    );

    res.json({ message: "Listing updated" });
  } catch (err) {
    console.error("PUT listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   DELETE /api/listings/:id  (deactivate)
────────────────────────────────────── */
router.delete("/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [rows] = await db.query("SELECT userId FROM listings WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    if (rows[0].userId !== req.user.id)
      return res.status(403).json({ message: "Not your listing" });

    await db.query("UPDATE listings SET isActive=0 WHERE id=?", [id]);
    res.json({ message: "Listing removed" });
  } catch (err) {
    console.error("DELETE listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   POST /api/listings/:id/save  (toggle save)
────────────────────────────────────── */
router.post("/:id/save", verifyToken, async (req, res) => {
  const listingId = parseInt(req.params.id, 10);
  const userId    = req.user.id;

  try {
    const [existing] = await db.query(
      "SELECT id FROM saved_listings WHERE userId=? AND listingId=?", [userId, listingId]
    );

    if (existing.length) {
      await db.query("DELETE FROM saved_listings WHERE userId=? AND listingId=?", [userId, listingId]);
      return res.json({ saved: false });
    }

    await db.query("INSERT INTO saved_listings (userId, listingId) VALUES (?,?)", [userId, listingId]);
    res.json({ saved: true });
  } catch (err) {
    console.error("Save listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/listings/saved/mine
────────────────────────────────────── */
router.get("/saved/mine", verifyToken, async (req, res) => {
  try {
    const [listings] = await db.query(
      `SELECT l.*, u.name AS ownerName
       FROM saved_listings sl
       JOIN listings l ON l.id = sl.listingId
       JOIN users u    ON u.id = l.userId
       WHERE sl.userId = ? AND l.isActive = 1
       ORDER BY sl.savedAt DESC`,
      [req.user.id]
    );
    res.json(listings);
  } catch (err) {
    console.error("Saved listings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────────────────────────────────────
   GET /api/listings/mine  (current user's listings)
────────────────────────────────────── */
router.get("/mine/all", verifyToken, async (req, res) => {
  try {
    const [listings] = await db.query(
      "SELECT * FROM listings WHERE userId=? ORDER BY createdAt DESC",
      [req.user.id]
    );
    res.json(listings);
  } catch (err) {
    console.error("My listings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;