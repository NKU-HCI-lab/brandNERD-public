const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const FOLDER_DATASETS='../../datasets';
const FOLDER_VERIFIED = `${FOLDER_DATASETS}/03_verified`;
const FOLDER_VALIDATED= `${FOLDER_DATASETS}/04_validated`;
const FOLDER_RESOLVED= `${FOLDER_DATASETS}/07_resolved`;

const INPUT_FILE=`${FOLDER_VERIFIED}/verified_canonicals.csv`;
const FILE_VERIFIED_CONFIDENCE=`${FOLDER_VERIFIED}/verified_confidence.json`;
const DATA_DIR = path.join(__dirname, "data");
const VALID_FILE =`${FOLDER_VALIDATED}/validated.csv`;
const INVALID_FILE =`${FOLDER_VALIDATED}/invalidated.csv`;
const LOOKUP_FILE = `${FOLDER_RESOLVED}/lookup.tsv`;


const FILE_JAROWINKLER='../05_similarity-calculation/_lib.jarowinkler.js'; // Location of file containing the similarity calculation script
const jaroWinkler=require(FILE_JAROWINKLER); // Load the rules from rules.js

/*
const jsonVerifiedConfidence=fs.existsSync(FILE_VERIFIED_CONFIDENCE) ? JSON.parse(fs.readFileSync(FILE_VERIFIED_CONFIDENCE,'utf8')) : {};
var validatedBrands=fs.existsSync(VALID_FILE) ? fs.readFileSync(VALID_FILE,'utf8').split(/[\r\n]+/) : [];
var invalidatedBrands=fs.existsSync(INVALID_FILE) ? fs.readFileSync(INVALID_FILE,'utf8').split(/[\r\n]+/) : [];
let lookupTableTemp=fs.existsSync(LOOKUP_FILE) ? fs.readFileSync(LOOKUP_FILE,'utf8').split(/[\r\n]+/) : [];
var lookupTable={};
if(lookupTableTemp.length>0){
	lookupTableTemp = [...new Set(lookupTableTemp)].sort();
	fs.writeFileSync(LOOKUP_FILE,lookupTableTemp.join('\n')+'\n'); 
	for(line of lookupTableTemp){
		line=line.split(/[\t]+/);
		lookupTable[line[0]]=line[1];
	}
}

if(validatedBrands.length>0){
	validatedBrands = [...new Set(validatedBrands)].sort();
	if(validatedBrands[0].length==0) validatedBrands.shift();
	fs.writeFileSync(VALID_FILE,validatedBrands.join('\n')+'\n'); 
}
if(invalidatedBrands.length>0){
	invalidatedBrands = [...new Set(invalidatedBrands)].sort();
	if(invalidatedBrands[0].length==0) invalidatedBrands.shift();
	fs.writeFileSync(INVALID_FILE,invalidatedBrands.join('\n')+'\n'); 
}
	
let countValidated=1;
let keys=Object.keys(jsonVerifiedConfidence);
for(key of keys){
	let confidence=Math.round((jsonVerifiedConfidence[key].c/jsonVerifiedConfidence[key].t)*100);
	if((jsonVerifiedConfidence[key].t>18 && confidence>20) || (jsonVerifiedConfidence[key].t>10 && confidence>30)){
		if(!validatedBrands.includes(key) && !invalidatedBrands.includes(key)){
			console.log(`${key}\t${jsonVerifiedConfidence[key].c}\t${confidence}%`);
			validatedBrands.push(key);
			fs.appendFileSync(VALID_FILE,key+'\n');
			countValidated++;
		}
	}
}
console.log(countValidated);
process.exit();
*/


function normalizeBrand(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  return s.trim();
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function googleBuyLink(brand) {
  const q = `buy ${brand} products`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

async function ensureDataFiles() {
  await fsp.mkdir(DATA_DIR, { recursive: true });

  for (const file of [VALID_FILE, INVALID_FILE]) {
    if (!fs.existsSync(file)) {
      await fsp.writeFile(file, "brand\n", "utf8");
    }
  }

  if (!fs.existsSync(LOOKUP_FILE)) {
    await fsp.writeFile(LOOKUP_FILE, "invalid\tvalid\n", "utf8");
  }
}

async function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const txt = await fsp.readFile(filePath, "utf8");
  return txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

async function loadAllBrandsFromInput() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing input file: ${INPUT_FILE}`);
  }

  const lines = await readLines(INPUT_FILE);
  const cleaned = lines
    .map((l) => l.replace(/^\uFEFF/, ""))
    .filter((l) => l.toLowerCase() !== "brand");

  const brands = cleaned.map(normalizeBrand).filter(Boolean);

  const seen = new Set();
  const unique = [];
  for (const b of brands) {
    const key = b.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(b);
    }
  }
  return unique;
}

async function loadDecisionsSet() {
  const validLines = await readLines(VALID_FILE);
  const invalidLines = await readLines(INVALID_FILE);

  const decided = new Set();

  for (const l of validLines) {
    if (l.toLowerCase() === "brand") continue;
    const b = normalizeBrand(l);
    if (b) decided.add(b.toLowerCase());
  }

  for (const l of invalidLines) {
    if (l.toLowerCase() === "brand") continue;
    const b = normalizeBrand(l);
    if (b) decided.add(b.toLowerCase());
  }

  return decided;
}

async function appendDecision(filePath, brand) {
  await fsp.appendFile(filePath, `${csvEscape(brand)}\n`, "utf8");
}

async function appendLookupTSV(invalidatedBrand, validatedBrand) {
  const left = String(invalidatedBrand ?? "").replace(/[\t\r\n]+/g, " ").trim();
  const right = String(validatedBrand ?? "").replace(/[\t\r\n]+/g, " ").trim();
  await fsp.appendFile(LOOKUP_FILE, `${left}\t${right}\n`, "utf8");
}

async function getRemainingBrands() {
  const [allBrands, decided] = await Promise.all([
    loadAllBrandsFromInput(),
    loadDecisionsSet(),
  ]);
  return allBrands.filter((b) => !decided.has(b.toLowerCase()));
}

function clampIndex(i, len) {
  if (!Number.isFinite(i) || i < 0) return 0;
  if (len <= 0) return 0;
  if (i >= len) return len - 1;
  return i;
}

function renderPage({ remaining, index, current, stats, message }) {
  const progressPct =
    stats.total === 0 ? 0 : Math.round((stats.decided / stats.total) * 100);

  const nextIndex = Math.min(index + 1, Math.max(remaining.length - 1, 0));
  const preview = remaining.slice(index + 1, index + 1 + 30);

  const googleUrl = current ? googleBuyLink(current) : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Brand Validator</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; max-width: 980px; }
    .top { display:flex; gap:16px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
    .brand { font-size: 28px; font-weight: 800; margin: 8px 0 14px; word-break: break-word; }
    .row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
    button, a.btn {
      border: 0; border-radius: 10px; padding: 12px 16px; font-weight: 800;
      cursor: pointer; display:inline-flex; align-items:center; gap:8px;
      text-decoration:none;
    }
    .valid { background:#e6ffed; color:#0a5; }
    .invalid { background:#ffe6e6; color:#a00; }
    .skip { background:#f2f2f2; color:#111; }
    .google { background:#eef4ff; color:#1a4fff; }
    .swap { background:#fff6e6; color:#8a5a00; }
    .muted { color:#555; }
    .msg { margin: 12px 0; color: #0b5; font-weight: 700; }
    progress { width: 260px; height: 18px; }
    table { width:100%; border-collapse: collapse; }
    td { padding: 6px 0; border-bottom: 1px solid #eee; }
    .small { font-size: 14px; }
    .kbd { padding: 2px 6px; border: 1px solid #ccc; border-bottom-width: 2px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .pill { display:inline-block; padding: 2px 10px; border-radius: 999px; border: 1px solid #ddd; font-weight: 700; font-size: 12px; }
    input[type="text"]{
      padding: 12px 12px;
      border-radius: 10px;
      border: 1px solid #ccc;
      min-width: 320px;
      font-weight: 650;
    }
    form.inline { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin:0; }
    .hint { margin-top: 8px; color:#666; font-size: 13px; }
    a.jump { color: inherit; text-decoration: none; font-weight: 650; }
    a.jump:hover { text-decoration: underline; }
    .idx { color:#888; font-size: 12px; padding-right: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <h1 style="margin:0;">Brand Validator</h1>
      <div class="muted small">
        Input: <span class="kbd">${escapeHtml(path.basename(INPUT_FILE))}</span>
        • Output: <span class="kbd">data/validated.csv</span> + <span class="kbd">data/invalidated.csv</span>
        • Lookup: <span class="kbd">data/lookup.tsv</span>
      </div>
    </div>
    <div class="card">
      <div class="small muted">Progress</div>
      <div style="display:flex;align-items:center;gap:12px;">
        <progress max="${stats.total}" value="${stats.decided}"></progress>
        <div><strong>${stats.decided}</strong> / ${stats.total} (${progressPct}%)</div>
      </div>
      <div class="small muted">${stats.remaining} remaining</div>
    </div>
  </div>

  ${message ? `<div class="msg">${escapeHtml(message)}</div>` : ""}

  <div class="card" style="margin-top:16px;">
    ${
      current
        ? `
      <div class="row" style="justify-content:space-between;">
        <div class="small muted">Current brand</div>
        <div class="pill">${index + 1} / ${remaining.length}</div>
      </div>

      <div class="brand">${escapeHtml(current)}</div>

      <div class="row" style="margin-bottom: 10px;">
        <form method="POST" action="/decide">
          <input type="hidden" name="brand" value="${escapeHtml(current)}" />
          <input type="hidden" name="decision" value="valid" />
          <input type="hidden" name="i" value="${index}" />
          <button class="valid" type="submit">✅ VALID</button>
        </form>

        <form method="POST" action="/decide">
          <input type="hidden" name="brand" value="${escapeHtml(current)}" />
          <input type="hidden" name="decision" value="invalid" />
          <input type="hidden" name="i" value="${index}" />
          <button class="invalid" type="submit">⛔ INVALID</button>
        </form>

        <button class="google" type="button" id="googleBtn"
          data-google-url="${escapeHtml(googleUrl)}">
          🔎 Google: buy ${escapeHtml(current)} products
        </button>

        <a class="btn skip" href="/?i=${nextIndex}">↩︎ Skip (show next)</a>
      </div>

      <div class="row">
        <form class="inline" method="POST" action="/swap">
          <input type="hidden" name="current" value="${escapeHtml(current)}" />
          <input type="hidden" name="i" value="${index}" />
          <input type="text" name="replacement" placeholder="Type the correct canonical brand…" autocomplete="off" />
          <button class="swap" type="submit">🔁 Invalidate current + Validate typed</button>
        </form>
      </div>
      <div class="hint">This appends <span class="kbd">current → replacement</span> to <span class="kbd">data/lookup.tsv</span>, marks <strong>current</strong> INVALID, and marks <strong>replacement</strong> VALID.</div>
    `
        : `
      <div class="brand" style="font-size:22px;">All done 🎉</div>
      <div class="muted">No remaining brands to label.</div>
    `
    }
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="small muted">Next up (click to jump)</div>
    <table>
      <tbody>
        ${preview
          .map((b, offset) => {
            const targetIndex = index + 1 + offset;
            return `<tr>
              <td>
                <span class="idx">${targetIndex + 1}</span>
                <a class="jump" href="/?i=${targetIndex}">${escapeHtml(b)}</a>
              </td>
            </tr>`;
          })
          .join("")}
        ${
          remaining.length > index + 1 + 30
            ? `<tr><td class="muted small">…and ${
                remaining.length - (index + 1 + 30)
              } more after that</td></tr>`
            : ""
        }
      </tbody>
    </table>
  </div>

  <script>
  (function () {
    // Keep a stable handle across clicks
    let googleWin = null;

    const btn = document.getElementById("googleBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const url = btn.getAttribute("data-google-url");
      if (!url) return;

      const name = "google_search_window";
      const features = "width=1100,height=800,toolbar=yes,location=yes,menubar=yes,scrollbars=yes,resizable=yes";

      try {
        // Reuse existing popup if possible
        if (googleWin && !googleWin.closed) {
          googleWin.location.href = url;
          googleWin.focus();
          return;
        }

        // Otherwise open a new one once
        googleWin = window.open("about:blank", name, features);

        if (!googleWin) {
          // Popup blocked; fall back to same tab
          window.location.href = url;
          return;
        }

        // Hardening: detach opener
        try { googleWin.opener = null; } catch (_) {}

        googleWin.location.href = url;
        googleWin.focus();
      } catch (e) {
        // Worst case fallback
        window.location.href = url;
      }
    });
  })();
</script>
</body>
</html>`;
}

app.get("/", async (req, res) => {
  try {
    await ensureDataFiles();

    const remaining = await getRemainingBrands();

    let index = Number.parseInt(String(req.query.i ?? "0"), 10);
    index = clampIndex(index, remaining.length);

    const current = remaining[index] || null;

    const allBrands = await loadAllBrandsFromInput();
    const decided = await loadDecisionsSet();
    const stats = {
      total: allBrands.length,
      decided: decided.size,
      remaining: remaining.length,
    };

    res.send(
      renderPage({
        remaining,
        index,
        current,
        stats,
        message: req.query.msg || "",
      })
    );
  } catch (err) {
    res.status(500).send(`<pre>${escapeHtml(String(err?.stack || err))}</pre>`);
  }
});

app.post("/decide", async (req, res) => {
  try {
    await ensureDataFiles();

    const brand = normalizeBrand(req.body.brand);
    const decision = String(req.body.decision || "").toLowerCase();

    let index = Number.parseInt(String(req.body.i ?? "0"), 10);
    if (!Number.isFinite(index) || index < 0) index = 0;

    if (!brand) {
      return res.redirect(`/?i=${index}&msg=` + encodeURIComponent("Missing brand."));
    }
    if (decision !== "valid" && decision !== "invalid") {
      return res.redirect(`/?i=${index}&msg=` + encodeURIComponent("Invalid decision."));
    }

    const decided = await loadDecisionsSet();
    if (!decided.has(brand.toLowerCase())) {
      if (decision === "valid") await appendDecision(VALID_FILE, brand);
      else await appendDecision(INVALID_FILE, brand);
    }

    const msg =
      decision === "valid" ? `Marked VALID: ${brand}` : `Marked INVALID: ${brand}`;

    res.redirect(`/?i=${index}&msg=` + encodeURIComponent(msg));
  } catch (err) {
    res.status(500).send(`<pre>${escapeHtml(String(err?.stack || err))}</pre>`);
  }
});

app.post("/swap", async (req, res) => {
  try {
    await ensureDataFiles();

    const current = normalizeBrand(req.body.current);
    const replacement = normalizeBrand(req.body.replacement);

    let index = Number.parseInt(String(req.body.i ?? "0"), 10);
    if (!Number.isFinite(index) || index < 0) index = 0;

    if (!current) {
      return res.redirect(
        `/?i=${index}&msg=` + encodeURIComponent("Missing current brand.")
      );
    }
    if (!replacement) {
      return res.redirect(
        `/?i=${index}&msg=` + encodeURIComponent("Please type a replacement brand.")
      );
    }

    const decided = await loadDecisionsSet();

    if (!decided.has(current.toLowerCase())) {
      await appendDecision(INVALID_FILE, current);
      decided.add(current.toLowerCase());
    }

    if (!decided.has(replacement.toLowerCase())) {
      await appendDecision(VALID_FILE, replacement);
      decided.add(replacement.toLowerCase());
    }

    await appendLookupTSV(current, replacement);

    const msg = `Swap saved: INVALID "${current}" → VALID "${replacement}"`;
    res.redirect(`/?i=${index}&msg=` + encodeURIComponent(msg));
  } catch (err) {
    res.status(500).send(`<pre>${escapeHtml(String(err?.stack || err))}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log(`Brand Validator running on http://localhost:${PORT}`);
  console.log(`Reading input: ${INPUT_FILE}`);
});