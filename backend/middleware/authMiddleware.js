const jwt = require("jsonwebtoken");
 
/**
 * verifyToken — Express middleware that checks for a valid Bearer JWT.
 * Attaches the decoded payload to req.user for downstream route handlers.
 *
 * Errors returned:
 *  403 — no token / malformed Authorization header
 *  401 — token present but invalid or expired
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
 
  // Fix: validate "Bearer <token>" format before splitting
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }
 
  // Safer than split(" ")[1] — works even if token contains spaces
  const token = authHeader.slice(7).trim();
 
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
 
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Distinguish expired tokens from outright invalid ones
      const message = err.name === "TokenExpiredError"
        ? "Token expired — please log in again"
        : "Invalid token";
      return res.status(401).json({ message });
    }
 
    req.user = decoded;
    next();
  });
};
 
module.exports = verifyToken;
 