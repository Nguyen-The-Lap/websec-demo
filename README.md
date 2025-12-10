# 🛡️ DDoS Simulator — Demo README

*A small, educational sandbox for testing rate-limiting, input validation, and WAF concepts.*

---

## ⚙️ Requirements

* **Node.js 18+ installed**
* **Run on localhost for demo only**

---

## 🚀 Install & Run

1. `npm install`
2. `npm start`
3. Open **[http://localhost:3000](http://localhost:3000)**

---

## 🎬 Demo Steps

### 🔍 1. Explore the UI

* Visit `/` and interact with the interface.

### 💥 2. Test payloads on the **VULNERABLE search**

Try inputs like:

* `q = alice' OR '1'='1`
* `q = <script>alert('xss')</script>`

**Observe:**

* The vulnerable page reflects input directly.
* SQLi payload may return extra rows.

### 🛡️ 3. Compare with the secure version

Navigate to `/secure/search` and try the *same* payloads.

**Observe:**

* Input is neutralized and safely handled.

### ➕ 4. Add a user with safe validation

* Go to `/secure/add-user` (validated & parameterized).

### 🚨 5. Demonstrate rate‑limiting

Open a terminal and run:

```
npm run ddos
```

**Observe:**

* After **10 requests within 10 seconds**, the server returns `429` responses.
* Shows the rate‑limiter message.

---

## 📌 Notes

* The **vulnerable route** is intentionally unsafe for demonstration. Remove it before any public deployment.
* The **"WAF" middleware** is a tiny demo blocker. Real WAFs (e.g., Cloudflare, AWS WAF) are far more advanced.

---

✨ *Use responsibly — this project is strictly for learning and safe local testing.*
