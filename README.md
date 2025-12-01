Pack My Cake - Fullstack demo
============================

How to run (local):

1. Install Node.js (v16+). In project root run:
   cd backend
   npm install
   npm run dev

2. Open http://localhost:3001

Notes:
- Backend listens on port 3001 and serves frontend static files.
- SQLite database file `packmycake.db` will be created in repository root when server starts.
- Seeded admin credentials: admin@packmycake.local / Admin@123
- GST breakdown applied at checkout: CGST 9% + SGST 9% (total 18%). HSN: 4819.
- Cart is stored in browser LocalStorage (key: pmc_cart).
