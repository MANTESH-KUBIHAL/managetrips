const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());


// 🔌 MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",   // same password
  database: "tripdb"
});


db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  } else {
    console.log("✅ MySQL connected");
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 🚕 add trip route
app.post("/add-trip", (req, res) => {
  const { from, to, fare, driverPay, driver } = req.body;

  console.log("📥 Trip received:", req.body);

  const sql = `
    INSERT INTO trips (
      from_location,
      to_location,
      fare,
      driver_pay,
      driver_username
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [from, to, fare, driverPay, driver],
    (err, result) => {
      if (err) {
        console.error("❌ DB insert error:", err);
        res.status(500).json({ error: "Database error" });
      } else {
        console.log("✅ Trip saved to database");
        res.json({ message: "Trip saved successfully" });
      }
    }
  );
});


// 📤 get all trips
app.get("/trips", (req, res) => {
  const sql = "SELECT * FROM trips ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch trips error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});






//onlydriver//

// 🚕 get trips for a specific driver
app.get("/trips/:driverUsername", (req, res) => {
  const { driverUsername } = req.params;

  const sql = `
    SELECT * FROM trips
    WHERE driver_username = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [driverUsername], (err, results) => {
    if (err) {
      console.error("❌ Fetch driver trips error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});





//usere

// 👤 get user by username
app.get("/user/:username", (req, res) => {
  const { username } = req.params;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result[0]);
  });
});



//get drivers
// Get all drivers
app.get("/drivers", (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'driver'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update user balance (after a trip)
app.put("/user/:username/balance", (req, res) => {
  const { username } = req.params;
  const { newBalance } = req.body;

  const sql = "UPDATE users SET balance = ? WHERE username = ?";
  db.query(sql, [newBalance, username], (err, result) => {
    if (err) {
      console.error("❌ DB update error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Balance updated" });
  });
});


app.listen(5000, () => {
  console.log("🚀 Backend started on port 5000");
});