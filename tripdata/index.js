const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 MySQL connection (Railway)
const db = mysql.createConnection({
  host: "mysql.railway.internal",  // your Railway host
  user: "root",                     // your Railway DB user
  password: "LPfpQOBAtQvnSRMJsDViyHLBmqRDGCmM", // Railway DB password
  database: "railway"               // Railway DB name
});

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection failed:", err.message);
    return;
  }
  console.log("✅ DB connected to Railway");
});

// --- Routes ---
app.get("/", (req, res) => res.send("Backend is running"));

// Add trip
app.post("/add-trip", (req, res) => {
  const { from, to, fare, driverPay, driver } = req.body;
  const sql = `
    INSERT INTO trips (from_location, to_location, fare, driver_pay, driver_username)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [from, to, fare, driverPay, driver], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Trip saved successfully" });
  });
});

// Get all trips
app.get("/trips", (req, res) => {
  db.query("SELECT * FROM trips ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get trips for a specific driver
app.get("/trips/:driverUsername", (req, res) => {
  const { driverUsername } = req.params;
  db.query(
    "SELECT * FROM trips WHERE driver_username = ? ORDER BY created_at DESC",
    [driverUsername],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Get user by username
app.get("/user/:username", (req, res) => {
  db.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result[0]);
  });
});

// Get all drivers
app.get("/drivers", (req, res) => {
  db.query("SELECT * FROM users WHERE role = 'driver'", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Update user balance
app.put("/user/:username/balance", (req, res) => {
  db.query("UPDATE users SET balance = ? WHERE username = ?", [req.body.newBalance, req.params.username], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Balance updated" });
  });
});

app.listen(5000, () => console.log("🚀 Backend started on port 5000"));
