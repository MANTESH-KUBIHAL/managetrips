const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");


const app = express();
app.use(cors());
app.use(express.json());

// 🔌 MySQL connection (Railway)
const db = mysql.createPool({
  host: "shortline.proxy.rlwy.net",
  user: "root",
  password: "hcAKkYBxkKIBExKCCkhHWdvBqtqCeRif",
  database: "railway",
  port: 15352,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


console.log("✅ MySQL pool initialized");

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB pool connection failed:", err.message);
  } else {
    console.log("✅ DB pool connected");
    connection.release();
  }
});


// --- Routes ---
app.get("/", (req, res) => res.send("Backend is running"));

// Add trip
app.post("/add-trip", async (req, res) => {
  const { from, to, fare, driverPay, driver } = req.body; // match frontend

  const sql = 
  `INSERT INTO trips (from_location, to_location, fare, driver_pay, driver_username)
    VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [from, to, fare, driverPay, driver], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json({ message: "Trip saved successfully" });
  });
});


// Get all trips
app.get("/trips", (req, res) => {
  db.query("SELECT * FROM trips", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
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
      if (err) return res.status(500).json({ error: "Database error", details: err.message });
      res.json(results);
    }
  );
});

// Get user by username
app.get("/user/:username", (req, res) => {
  db.query("SELECT * FROM users WHERE username = ?", [req.params.username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error", details: err.message });
    if (result.length === 0) return res.status(404).json({ error: "User not found", details: err.message });
    res.json(result[0]);
  });
});

// Get all drivers
app.get("/drivers", (req, res) => {
  db.query("SELECT * FROM users WHERE role = 'driver'", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(results);
  });
});

// Update user balance
app.put("/user/:username/balance", (req, res) => {
  db.query("UPDATE users SET balance = ? WHERE username = ?", [req.body.newBalance, req.params.username], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json({ message: "Balance updated" });
  });
});


app.post("/bookings", (req, res) => {
  console.log("Incoming booking:", req.body);

  const { from_location, to_location, people_count, gender } = req.body;

if (!from_location || !to_location || !gender || Number(people_count) <= 0) {
  return res.status(400).json({ message: "Invalid input" });
}

  const sql =
    "INSERT INTO bookings (from_location, to_location, people_count, gender) VALUES (?, ?, ?, ?)";

db.query(
  sql,
  [from_location, to_location, Number(people_count), gender],
  (err) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    res.json({ message: "Booking stored" });
  }
);
});


app.get("/bookings", (req, res) => {
  db.query(
    "SELECT * FROM bookings ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ message: "DB Error" });
      }
      res.json(results);
    }
  );
});

app.listen(5000, () => console.log("🚀 Backend started on port 5000"));
