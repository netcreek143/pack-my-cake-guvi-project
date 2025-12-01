const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./packmycake.db");

// Initialize tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      isAdmin INTEGER DEFAULT 0
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      price REAL,
      moq INTEGER,
      size TEXT,
      category TEXT,
      image TEXT,
      description TEXT
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT,
      customer_email TEXT,
      shipping_address TEXT,
      items TEXT,
      subtotal REAL,
      cgst REAL,
      sgst REAL,
      total REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // --- AUTO-SEED ADMIN USER (Always ensured to exist) ---
  // Password hash for "Admin@123"
  const adminPasswordHash =
    "$2b$10$v9Ma1jIhBWgjmF2r76P54uQkwBHwICOSqHXMgUEYwRLQORt8lwo1u";

  db.run(
    `INSERT OR IGNORE INTO users (id, name, email, password, isAdmin)
     VALUES (1, 'Admin', 'admin@packmycake.local', ?, 1)`,
    [adminPasswordHash]
  );

  // --- AUTO-SEED SAMPLE PRODUCTS ---
  const sampleProducts = [
    [
      "1kg Square Cake Box",
      15,
      50,
      '8x8x5"',
      "Cake Boxes",
      "/images/box1.png",
      "Strong 1kg square cake box for professional baking."
    ],
    [
      "Half kg Rectangle Box",
      12,
      50,
      '7x4x2"',
      "Cake Boxes",
      "/images/box2.png",
      "Durable half kg rectangular cake box."
    ],
    [
      "Cupcake Box 12",
      20,
      25,
      '10x8x3"',
      "Cupcake Boxes",
      "/images/box3.png",
      "Premium 12-slot cupcake box."
    ],
    [
      "Pastry Tray 24",
      25,
      30,
      '12x9x2"',
      "Pastry Boxes",
      "/images/box4.png",
      "High-quality 24-slot pastry tray."
    ]
  ];

  sampleProducts.forEach((p) => {
    db.run(
      `INSERT OR IGNORE INTO products (title, price, moq, size, category, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p
    );
  });

  console.log("✅ Database ready + Admin auto-seeded + Sample products loaded.");
});

module.exports = db;
