const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const JWT_SECRET = "supersecretkey";

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static("../frontend"));

// ------------ DATABASE SETUP ------------------

const db = new sqlite3.Database("packmycake.db", (err) => {
  if (err) console.error("DB Error:", err);
  console.log("SQLite DB connected");
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        isAdmin INTEGER DEFAULT 0
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS products(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price REAL,
        moq INTEGER,
        size TEXT,
        category TEXT,
        image TEXT,
        description TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        items TEXT,
        total REAL,
        name TEXT,
        phone TEXT,
        address TEXT,
        createdAt TEXT
    )`);
});

// ------------ FORCE SEED ADMIN ------------------

function seedAdmin() {
  db.get(
    "SELECT * FROM users WHERE email = ?",
    ["admin@packmycake.local"],
    async (err, row) => {
      if (!row) {
        const hashed = await bcrypt.hash("admin123", 10);
        db.run(
          "INSERT INTO users(name,email,password,isAdmin) VALUES (?,?,?,1)",
          ["Admin", "admin@packmycake.local", hashed],
          () => console.log("Admin user created")
        );
      } else {
        console.log("Admin already exists");
      }
    }
  );
}

seedAdmin();

// ------------ AUTH ROUTES ------------------

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users(name,email,password,isAdmin) VALUES (?,?,?,0)",
    [name, email, hashed],
    function () {
      res.json({ success: true });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.status(401).json({ message: "Invalid Email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, isAdmin: user.isAdmin });
  });
});

// ------------ PRODUCT ROUTES ------------------

app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/products", (req, res) => {
  const { title, price, moq, size, category, image, description } = req.body;

  db.run(
    `INSERT INTO products(title,price,moq,size,category,image,description)
     VALUES (?,?,?,?,?,?,?)`,
    [title, price, moq, size, category, image, description],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// ------------ ORDER ROUTES ------------------

app.post("/api/orders", (req, res) => {
  const { userId, items, total, name, phone, address } = req.body;

  db.run(
    `INSERT INTO orders(userId,items,total,name,phone,address,createdAt)
     VALUES (?,?,?,?,?,?,datetime('now'))`,
    [userId, JSON.stringify(items), total, name, phone, address],
    function () {
      res.json({ orderId: this.lastID });
    }
  );
});

app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", (err, rows) => {
    res.json(rows);
  });
});

// Fallback to frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
