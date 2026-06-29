// Baut Projects/_GUT/index.html automatisch aus allen Demo-Ordnern.
// Liest pro Demo <title> + <meta name="description"> aus deren index.html.
// Lokal ausführbar (node .github/scripts/build-index.mjs) und im CI bei jedem Deploy.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "Projects", "_GUT");

// ── Anpassbar (Kevin): Markenname + Texte der Übersichtsseite ───────────────
const SITE = {
  brand: "",                       // dein Firmen-/Markenname (leer = nur Headline)
  headline: "Tools, die kleinen Betrieben Geld retten",
  intro:
    "Echte, sofort ausprobierbare Demos. Trag dich in der Demo, die zu dir passt, " +
    "auf die Warteliste ein — was genug Zuspruch bekommt, bauen wir voll aus.",
};
// ────────────────────────────────────────────────────────────────────────────

const grab = (re, html) => { const m = html.match(re); return m ? m[1].trim() : ""; };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const splitName = (title) => title.split(/[—–|·]/);

const demos = readdirSync(ROOT)
  .filter((name) => {
    const p = join(ROOT, name);
    return statSync(p).isDirectory() && existsSync(join(p, "index.html"));
  })
  .map((name) => {
    const html = readFileSync(join(ROOT, name, "index.html"), "utf8");
    const title = grab(/<title>([^<]*)<\/title>/i, html);
    const desc = grab(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html);
    const parts = splitName(title);
    return {
      dir: name,
      name: (parts[0] || name).trim(),
      pitch: (desc || parts.slice(1).join(" ").trim() || "").trim(),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "de"));

const arrow =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const cards = demos
  .map(
    (d) => `      <a class="card" href="./${esc(d.dir)}/">
        <span class="card-top">
          <span class="card-name">${esc(d.name)}</span>
          <span class="pill">Demo · Warteliste</span>
        </span>
        <span class="card-pitch">${esc(d.pitch)}</span>
        <span class="card-go">Demo ansehen ${arrow}</span>
      </a>`
  )
  .join("\n");

const brandMark = SITE.brand
  ? `<span class="brand"><span class="dot" aria-hidden="true"></span>${esc(SITE.brand)}</span>`
  : "";

const page = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(SITE.headline)}</title>
<meta name="description" content="${esc(SITE.intro)}">
<style>
  :root{
    --bg:#0f1115; --surface:#171a20; --line:#262b33; --line-soft:#1e222a;
    --ink:#f4f6f9; --muted:#94a0b0; --meta:#5b6675;
    --accent:#3ecf8e; --accent-on:#06140d;
    --font:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:ui-monospace,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--bg);color:var(--ink);font:16px/1.6 var(--font);-webkit-font-smoothing:antialiased}
  .wrap{max-width:680px;margin:0 auto;padding:40px 20px 64px}
  header{margin-bottom:32px}
  .brand{display:inline-flex;align-items:center;gap:8px;font:600 .82rem var(--mono);color:var(--muted);letter-spacing:.02em;margin-bottom:18px}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--accent)}
  h1{font-size:1.95rem;line-height:1.18;letter-spacing:-.02em;margin:0 0 12px;max-width:18ch}
  .intro{color:var(--muted);margin:0;max-width:54ch}
  .grid{display:flex;flex-direction:column;gap:14px;margin-top:34px}
  .card{display:flex;flex-direction:column;gap:10px;text-decoration:none;color:inherit;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:20px;transition:border-color .15s,transform .15s}
  .card:hover{border-color:var(--accent);transform:translateY(-2px)}
  .card:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
  .card-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .card-name{font-weight:700;font-size:1.15rem;letter-spacing:-.01em}
  .pill{flex:none;font:600 .66rem/1 var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--meta);border:1px solid var(--line);border-radius:999px;padding:6px 9px}
  .card-pitch{color:var(--muted);font-size:.96rem;margin:0}
  .card-go{display:inline-flex;align-items:center;gap:7px;font-weight:600;font-size:.9rem;color:var(--accent)}
  footer{margin-top:44px;padding-top:20px;border-top:1px solid var(--line-soft);color:var(--meta);font-size:.82rem}
  .empty{color:var(--muted);background:var(--surface);border:1px dashed var(--line);border-radius:16px;padding:24px;text-align:center}
  @media (prefers-reduced-motion:reduce){.card{transition:none}.card:hover{transform:none}}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      ${brandMark}
      <h1>${esc(SITE.headline)}</h1>
      <p class="intro">${esc(SITE.intro)}</p>
    </header>
    <main class="grid">
${cards || '      <div class="empty">Bald geht’s los — die ersten Demos kommen in Kürze.</div>'}
    </main>
    <footer>Frühzugang · jede Demo ist ein früher Stand, kein fertiges Produkt. © <span id="yr"></span></footer>
  </div>
  <script>document.getElementById("yr").textContent=new Date().getFullYear()</script>
</body>
</html>
`;

writeFileSync(join(ROOT, "index.html"), page);
console.log(`Übersicht gebaut: ${demos.length} Demo(s) → ${demos.map((d) => d.name).join(", ") || "(keine)"}`);
