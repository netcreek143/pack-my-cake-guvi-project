const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("packmycake.db");

// ADMIN DETAILS
const adminEmail = "admin@packmycake.local";
const adminPassword = "admin123"; // password you want to use
const adminName = "Admin";

// CHECK IF ADMIN EXISTS
db.get("SELECT * FROM users WHERE email = ?", [adminEmail], async (err, row) => {
  if (row) {
    console.log("Admin already exists ✔️");
    db.close();
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    db.run(
      "INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, 1)",
      [adminName, adminEmail, hashedPassword],
      (err) => {
        if (err) {
          console.error("❌ Error creating admin:", err.message);
        } else {
          console.log("✅ Admin user created successfully!");
        }
        db.close();
      }
    );
  }
});
