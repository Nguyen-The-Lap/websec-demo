// db.js
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './demo.db';

const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        bio TEXT
      )
    `);

    // Seed users
    const stmt = db.prepare("INSERT OR IGNORE INTO users(username, bio) VALUES (?, ?)");
    stmt.run("alice", "I love cats.");
    stmt.run("bob", "Security enthusiast.");
    stmt.finalize();
  });
}

function getUsersByNameUnsafe(name, cb) {
  // UNSAFE: builds query via concatenation (vulnerable to SQLi) - demo only
  const q = `SELECT id, username, bio FROM users WHERE username LIKE '%${name}%'`;
  db.all(q, (err, rows) => cb(err, rows));
}

function getUsersByNameSafe(name, cb) {
  // SAFE: parameterized
  const q = `SELECT id, username, bio FROM users WHERE username LIKE ?`;
  db.all(q, [`%${name}%`], (err, rows) => cb(err, rows));
}

function addUserSafe(username, bio, cb) {
  const q = `INSERT INTO users(username, bio) VALUES(?, ?)`;
  db.run(q, [username, bio], function (err) {
    cb(err, { id: this.lastID });
  });
}

module.exports = {
  db, init, getUsersByNameUnsafe, getUsersByNameSafe, addUserSafe
};
