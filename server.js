const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const db = new sqlite3.Database('./social.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    delivery TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO services (title, description, price, delivery, image) VALUES 
        ('باقة متابعين انستجرام', '1000 متابع حقيقي ومتفاعل', 100, 'خلال 24 ساعة', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'),
        ('تصميم لوجو احترافي', 'لوجو مميز لشركتك مع 3 تعديلات', 250, '3 أيام', 'https://images.unsplash.com/photo-1626785774573-4b799315adfa?w=400')
      `);
    }
  });
});

app.get('/api/services', (req, res) => {
  db.all("SELECT * FROM services ORDER BY created_at DESC", (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/services', (req, res) => {
  const { title, description, price, delivery, image } = req.body;
  db.run(`INSERT INTO services (title, description, price, delivery, image) VALUES (?, ?, ?, ?, ?)`,
    [title, description, price, delivery, image],
    function(err) {
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.delete('/api/services/:id', (req, res) => {
  db.run("DELETE FROM services WHERE id = ?", req.params.id, () => {
    res.json({ success: true });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
