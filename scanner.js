const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const VIDEO_DIR = '/mnt/videos';
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY,
      title TEXT,
      category TEXT,
      file TEXT,
      poster TEXT
    )
  `);
});

function scan(dir, category) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isFile() && /\.(mp4|mkv)$/i.test(file)) {
      db.run(
        `INSERT OR IGNORE INTO videos (title, category, file)
         VALUES (?, ?, ?)`,
        [file.replace(/\..+$/, ''), category, full]
      );
    }
  });
}

['Movies', 'TV Shows', 'Anime'].forEach(cat => {
  const folder = path.join(VIDEO_DIR, cat);
  if (fs.existsSync(folder)) scan(folder, cat);
});
