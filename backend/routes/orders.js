const express = require('express');
const router = express.Router();
const { db } = require('../database');
const jwt = require('jsonwebtoken');
const config = { JWT_SECRET: process.env.JWT_SECRET || 'packmycake_secret', GST: 18, HSN: '4819' };

// middleware to get user from Authorization header
function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, config.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = payload; next();
  });
}

// POST /api/orders - place order
router.post('/', authRequired, (req, res) => {
  const { customer_name, customer_email, shipping_address, items, subtotal } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart empty' });
  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const total = +(subtotal + cgst + sgst).toFixed(2);
  const items_json = JSON.stringify(items);
  db.run('INSERT INTO orders (user_id,customer_name,customer_email,shipping_address,items_json,subtotal,cgst,sgst,total,hsn) VALUES (?,?,?,?,?,?,?,?,?,?)', [req.user.id, customer_name, customer_email, shipping_address, items_json, subtotal, cgst, sgst, total, config.HSN], function(err) {
    if (err) return res.status(500).json({ error: 'DB insert error' });
    res.json({ id: this.lastID, subtotal, cgst, sgst, total, hsn: config.HSN });
  });
});

// GET /api/orders/mine
router.get('/mine', authRequired, (req, res) => {
  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items_json) })) );
  });
});

// Admin: GET /api/orders (all)
router.get('/', (req, res) => {
  // simple admin check via query token (for demo). In production use proper middleware.
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, config.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    if (!payload.isAdmin) return res.status(403).json({ error: 'Admin only' });
    db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items_json) })) );
    });
  });
});

module.exports = router;
