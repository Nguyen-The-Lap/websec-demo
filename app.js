// app.js
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const { body, query, validationResult } = require('express-validator');
const path = require('path');
const dbLayer = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// init DB
dbLayer.init();

app.use(helmet());                   // basic security headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(xss());                      // basic XSS sanitization on inputs
app.use(express.static(path.join(__dirname, 'public')));

// Simple WAF-like middleware for demo: block suspicious patterns
const wafPatterns = [
  /union\s+select/i,
  /--/i,
  /or\s+1=1/i,
  /<script>/i
];
app.use((req, res, next) => {
  const payload = `${JSON.stringify(req.body)} ${JSON.stringify(req.query)} ${JSON.stringify(req.params)}`;
  for (const p of wafPatterns) {
    if (p.test(payload)) {
      return res.status(403).json({ error: "Blocked by demo WAF: suspicious input detected." });
    }
  }
  next();
});

// Rate limiter (basic DDoS mitigation demo)
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 second window
  max: 10,             // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — demo rate limit triggered." }
});
app.use(limiter);

// --------- Routes ----------

// Home page (demo UI)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Vulnerable search (DEMO ONLY): shows how SQLi and reflected XSS can be exploited
app.get('/vulnerable/search', [
  query('q').optional().isString().trim()
], (req, res) => {
  const q = req.query.q || '';
  // intentionally using unsafe DB function to demonstrate SQLi
  dbLayer.getUsersByNameUnsafe(q, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // reflect raw user-provided string into HTML (vulnerable to XSS if not sanitized)
    let html = `<h2>VULNERABLE SEARCH results for: ${q}</h2><ul>`;
    rows.forEach(r => {
      html += `<li>${r.username}: ${r.bio}</li>`;
    });
      // Use a template literal here so the example single-quotes don't terminate the string
      html += `</ul><p>Try typical attacks: <code>q=alice' OR '1'='1</code> or <code>&lt;script&gt;alert(1)&lt;/script&gt;</code></p>`;
    res.send(html);
  });
});

// Secure search (parameterized + output encoding)
app.get('/secure/search', [
  query('q').optional().isString().trim().escape()  // express-validator escape to neutralize special chars in query string
], (req, res) => {
  // note: xss-clean already sanitized input; we still use parameterized DB call
  const q = req.query.q || '';
  dbLayer.getUsersByNameSafe(q, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Encode output to avoid reflected XSS
    const encode = (s) => String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#x27;');
    let html = `<h2>SECURE SEARCH results for: ${encode(q)}</h2><ul>`;
    rows.forEach(r => {
      html += `<li>${encode(r.username)}: ${encode(r.bio)}</li>`;
    });
    html += '</ul>';
    res.send(html);
  });
});

// Add user (secure)
app.post('/secure/add-user', [
  body('username').isLength({ min: 3, max: 30 }).trim().escape(),
  body('bio').optional().isString().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { username, bio } = req.body;
  dbLayer.addUserSafe(username, bio, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ ok: true, id: result.id });
  });
});

// A simple endpoint to show headers & counts (for demo)
app.get('/info', (req, res) => {
  res.json({
    now: new Date().toISOString(),
    ip: req.ip,
    note: "This demo app includes vulnerable and secure endpoints. See /vulnerable/search and /secure/search"
  });
});

// start
app.listen(PORT, () => {
  console.log(`WebSec demo running at http://localhost:${PORT}`);
});
