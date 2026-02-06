const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('database.db');
const SECRET = 'pistream-secret';

app.use(express.json());
app.use(express.static('public'));

// USERS
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT
)`);

// LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username=?`, [username], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.sendStatus(401);
    res.json({ token: jwt.sign({ id: user.id }, SECRET) });
  });
});

// AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(403);
  jwt.verify(token, SECRET, () => next());
}

// VIDEO LIST
app.get('/api/videos', auth, (req, res) => {
  db.all(`SELECT * FROM videos`, (e, rows) => res.json(rows));
});

// STREAM
app.get('/video', auth, (req, res) => {
  const file = req.query.file;
  const stat = fs.statSync(file);
  const range = req.headers.range;
  const start = Number(range.replace(/\D/g, ''));
  const end = stat.size - 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'video/mp4',
  });

  fs.createReadStream(file, { start, end }).pipe(res);
});

app.listen(3000);
