Requirements:
- Node.js 18+ installed
- Run on localhost for demo only

Install & run:
1. npm install
2. npm start
3. Open http://localhost:3000

Demo steps:
- Visit / and use the UI
- Try payloads on the VULNERABLE search:
    q = alice' OR '1'='1
    q = <script>alert('xss')</script>
  Observe: vulnerable page reflects input and SQLi may return more rows.
- Try same payloads on /secure/search and observe they are neutralized.
- Add a user via /secure/add-user (validated & parameterized).
- To demo rate-limiter: open terminal and run:
    npm run ddos
  Observe: after 10 requests in a 10s window the server returns 429 responses (rate-limiter message).

Notes:
- The vulnerable route is intentionally unsafe to demonstrate attacks. Remove it before any public deployment.
- The "WAF" middleware is a tiny demo blocker; production WAFs are far more sophisticated (Cloudflare, AWS WAF, etc).
