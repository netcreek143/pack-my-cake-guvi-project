const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("packmycake.db", (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Database connected");
  }
});

db.all("SELECT id, name, email, isAdmin FROM users", (err, rows) => {
  if (err) {
    console.error("❌ Query error:", err.message);
  } else {
    console.log("📌 Users in database:");
    console.table(rows);
  }

  db.close();
});
