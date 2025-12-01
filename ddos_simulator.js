// ddos_simulator.js
// Simple demo script to fire many requests at the server to show rate limiter blocking.
// Run: node ddos_simulator.js
const http = require('http');

const HOST = 'localhost';
const PORT = 3000;
const PATH = '/info';
const CONCURRENCY = 40;
const TOTAL = 60;

function sendRequest(i) {
  const opts = { hostname: HOST, port: PORT, path: PATH, method: 'GET' };
  const req = http.request(opts, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      console.log(`#${i} - ${res.statusCode} - ${data.length} bytes`);
    });
  });
  req.on('error', (e) => console.error('err', e.message));
  req.end();
}

(async function run() {
  console.log('Starting demo flood test...');
  for (let i=0;i<TOTAL;i++) {
    sendRequest(i+1);
    // small spacing to mimic bursty traffic
    await new Promise(r => setTimeout(r, Math.random()*150));
  }
})();
