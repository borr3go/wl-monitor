const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const RBL = 4586; // Löwengasse

function fetchWL(rbl) {
  return new Promise((resolve, reject) => {
    const url = `https://www.wienerlinien.at/ogd_realtime/monitor?rbl=${rbl}&activateTrafficInfo=stoerungkurz`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error')); }
      });
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/departures') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const data = await fetchWL(RBL);
      res.writeHead(200);
      res.end(JSON.stringify(data));
    } catch(e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }

  } else if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(content);
    });

  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`WL Monitor corriendo en puerto ${PORT}`);
});
