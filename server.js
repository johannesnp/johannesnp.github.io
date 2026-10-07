#!/usr/bin/env node
/**
 * Det Store Hyttetur Oppgjøret™ – liten delt-server
 * ────────────────────────────────────────────────────
 * • Serverer oppgjørssiden (det-store-hyttetur-oppgjoret.html)
 * • Deler avkrysningene live mellom alle som har siden åpen (SSE)
 * • Lagrer tilstanden i state.json, så den overlever omstart
 *
 * Kjøring:      node server.js       →  åpne http://localhost:3000
 * Port:         settes med miljøvariabelen PORT (standard 3000)
 * Ingen avhengigheter – kun Node.js innebygde moduler.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HTML = path.join(__dirname, "det-store-hyttetur-oppgjoret.html");
const STATE_FILE = path.join(__dirname, "state.json");

/* ── Tilstand: { "12": "2", ... } – manglende nøkkel betyr "f" (felles) ── */
let values = {};
try {
  if (fs.existsSync(STATE_FILE)) {
    values = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) || {};
  }
} catch (e) {
  console.error("Kunne ikke lese state.json (starter tomt):", e.message);
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(STATE_FILE, JSON.stringify(values, null, 2), err => {
      if (err) console.error("Lagring feilet:", err.message);
    });
  }, 150);
}

/* ── Live-synk til alle åpne sider ── */
const clients = new Set();
function broadcast(msg) {
  const data = "data: " + JSON.stringify(msg) + "\n\n";
  for (const res of clients) {
    try { res.write(data); } catch (e) { /* klient forsvant */ }
  }
}

function json(res, code, obj) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  const p = url.pathname;

  /* Forsiden */
  if (req.method === "GET" && (p === "/" || p === "/index.html")) {
    fs.readFile(HTML, (err, buf) => {
      if (err) { res.writeHead(500); res.end("Fant ikke HTML-filen"); return; }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(buf);
    });
    return;
  }

  /* Hent hele tilstanden */
  if (req.method === "GET" && p === "/api/state") {
    json(res, 200, { values });
    return;
  }

  /* Endre én vare */
  if (req.method === "POST" && p === "/api/state") {
    let body = "";
    req.on("data", c => {
      body += c;
      if (body.length > 10000) req.destroy();
    });
    req.on("end", () => {
      let msg;
      try { msg = JSON.parse(body); } catch (e) { json(res, 400, { error: "Ugyldig JSON" }); return; }
      const i = String(msg && msg.i);
      const v = String(msg && msg.v);
      if (!/^\d+$/.test(i) || !["f", "1", "2", "3"].includes(v)) {
        json(res, 400, { error: "Ugyldig i/v" });
        return;
      }
      values[i] = v;
      save();
      broadcast({ type: "set", i: Number(i), v });
      json(res, 200, { ok: true });
    });
    return;
  }

  /* Live-strøm (Server-Sent Events) */
  if (req.method === "GET" && p === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write(": tilkoblet\n\n");
    clients.add(res);
    const ping = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (e) {}
    }, 25000);
    req.on("close", () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Ikke funnet");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("──────────────────────────────────────────────");
  console.log(" Det Store Hyttetur Oppgjøret™ kjører!");
  console.log(" Åpne:  http://localhost:" + PORT);
  console.log(" Del:   http://<din-ip>:" + PORT + "  (samme wifi)");
  console.log("──────────────────────────────────────────────");
});
