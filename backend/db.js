// db.js - MySQL database connection with connection pool
const mysql = require("mysql2");
require("dotenv").config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "roomielink",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Railway requires SSL - enable it
  ssl: {
    rejectUnauthorized: false
  }
});

// Promisify for async/await usage
const promisePool = pool.promise();

// Test connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log("Connected to MySQL database");
    console.log(`Database: ${process.env.DB_NAME || "roomielink"}`);
    console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
    connection.release();
    return true;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error("Full error:", err);
    return false;
  }
};

testConnection();

module.exports = promisePool;