/**
 * server.js — single-file Node.js/Express app
 *
 * What it does:
 * - Reads aggregated JSON: { VALIDATED_CANONICAL: [BRAND1, BRAND2, ...], ... }
 * - Reads validated.csv (first column) to power a substitute canonical datalist
 * - Reads lookup.tsv (tab-separated BRAND\tVALIDATEDBRAND) and hides any BRAND already in column 1
 * - Shows pending groups (not resolved yet) with unresolved brands (not in lookup.tsv)
 * - Lets user select/deselect brands and choose a substitute canonical
 * - On Approve: appends selected rows to lookup.tsv and marks the group resolved so it never shows again
 *
 * Setup:
 *   npm init -y
 *   npm i express
 *   node server.js
 *
 * Then open:
 *   http://localhost:3000
 */

const fs = require("fs");
const path = require("path");
const express = require("express");

/** =========================
 * CONFIG — EDIT THESE PATHS
 * ========================= */
const CONFIG = {
  PORT: 3000,

  // Inputs
  AGGREGATED_JSON_PATH: "../../datasets/06_aggregated/aggregated_65.json",
  VALIDATED_CSV_PATH: "../../datasets/04_validated/validated.csv",

  // Output lookup table (TSV with rows: BRAND\tVALIDATEDBRAND, no header)
  LOOKUP_TSV_PATH: "../../datasets/07_resolved/lookup.tsv",

  // Persistent app state so resolved groups never show again
  // (Created automatically if missing)
  STATE_PATH: path.join(__dirname, "data", "state.json"),
};

/** =========================
 * Utilities
 * ========================= */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readFileUtf8Safe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function parseFirstColumnCsvLines(csvText) {
  // Minimal parsing: assumes canonical strings don't contain embedded commas/quotes.
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];
  return lines
    .map((line) => line.split(",")[0].trim())
    .filter(Boolean);
}

function loadAggregatedJson(jsonPath) {
  const raw = readFileUtf8Safe(jsonPath);
  if (!raw) throw new Error(`Could not read aggregated JSON at: ${jsonPath}`);
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Aggregated JSON must be an object: { VALIDATED: [BRAND, ...], ... }");
  }
  return parsed;
}

function loadValidatedCanonicals(validatedCsvPath) {
  const raw = readFileUtf8Safe(validatedCsvPath);
  if (!raw) return [];
  const vals = parseFirstColumnCsvLines(raw);
  return Array.from(new Set(vals));
}

function loadLookupBrandsSet(lookupTsvPath) {
  const raw = readFileUtf8Safe(lookupTsvPath);
  if (!raw) return new Set();
  const brands = new Set();

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [brand] = trimmed.split("\t");
    if (brand) brands.add(brand.trim());
  });

  return brands;
}

function loadState(statePath) {
  try {
    const raw = fs.readFileSync(statePath, "utf8");
    const st = JSON.parse(raw);
    if (!st || typeof st !== "object") return { resolvedGroups: {} };
    if (!st.resolvedGroups || typeof st.resolvedGroups !== "object") st.resolvedGroups = {};
    return st;
  } catch {
    return { resolvedGroups: {} };
  }
}

function saveState(statePath, state) {
  ensureDir(path.dirname(statePath));
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function appendLookupRows(lookupPath, rows) {
  // rows: Array<{ brand, validatedBrand }>
  if (!rows.length) return;
  const text = rows.map((r) => `${r.brand}\t${r.validatedBrand}`).join("\n") + "\n";
  fs.appendFileSync(lookupPath, text, "utf8");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function computePendingGroups({ aggregated, validatedList, lookupBrands, state }) {
  const resolved = state.resolvedGroups || {};
  const groups = [];

  for (const [keyValidated, brandList] of Object.entries(aggregated)) {
    if (resolved[keyValidated]) continue;

    const brands = Array.isArray(brandList) ? brandList : [];
    const unresolved = brands.filter((b) => b && !lookupBrands.has(b));

    if (unresolved.length === 0) continue;

    groups.push({
      keyValidated,
      totalBrands: brands.length,
      unresolvedBrands: unresolved,
      substituteDefault: keyValidated,
    });
  }

  // Sort largest groups first
  groups.sort((a, b) => b.unresolvedBrands.length - a.unresolvedBrands.length);
  return groups;
}

/** =========================
 * Inline UI (CSS + JS + HTML)
 * ========================= */
const STYLES_CSS = `
:root {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji",
    "Segoe UI Emoji";
}
body { margin: 0; background: #0b0e14; color: #e8eefc; }
a.link { color: #9cc2ff; text-decoration: none; }
a.link:hover { text-decoration: underline; }

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid #1a2232;
  background: #0b0e14;
  position: sticky;
  top: 0;
}
h1 { margin: 0 0 6px 0; font-size: 18px; }
.subtle { margin: 0; color: #a8b3cc; font-size: 13px; }

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 18px 50px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card {
  background: #101625;
  border: 1px solid #1a2232;
  border-radius: 14px;
  padding: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 10px;
}
.title { display: flex; align-items: center; gap: 10px; font-size: 15px; }
.pill {
  font-size: 11px;
  padding: 3px 8px;
  border: 1px solid #2a3752;
  border-radius: 999px;
  color: #a8b3cc;
}
.meta { margin-top: 6px; font-size: 12px; color: #a8b3cc; }
.dot { margin: 0 8px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.card-controls { display: flex; gap: 8px; }

.form { margin-top: 10px; }
.row { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; }

.label { display: grid; gap: 6px; font-size: 12px; color: #a8b3cc; }
.input {
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid #2a3752;
  background: #0b0e14;
  color: #e8eefc;
}
.hint { font-size: 12px; color: #a8b3cc; }

.brands {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  border: 1px dashed #2a3752;
  background: rgba(11, 14, 20, 0.4);
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #1a2232;
  background: #0b0e14;
  cursor: pointer;
}
.brand input { transform: scale(1.1); }

.footer { margin-top: 12px; display: flex; justify-content: flex-end; }

.btn {
  border: 1px solid #2a3752;
  background: #0b0e14;
  color: #e8eefc;
  padding: 9px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
}
.btn.secondary:hover { border-color: #3a4d73; }
.btn.primary { background: #1c355f; border-color: #2d4f8a; }
.btn.primary:hover { filter: brightness(1.08); }

.empty {
  padding: 30px;
  border: 1px solid #1a2232;
  border-radius: 14px;
  background: #101625;
}

.notice {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #2a3752;
  background: rgba(28, 53, 95, 0.18);
  color: #a8b3cc;
  font-size: 12px;
}
`;

const APP_JS = `
(function () {
  function setAll(card, checked) {
    const boxes = card.querySelectorAll('input[type="checkbox"][name="selectedBrands"]');
    boxes.forEach((b) => (b.checked = checked));
  }

  document.querySelectorAll("[data-card]").forEach((card) => {
    const btnAll = card.querySelector("[data-select-all]");
    const btnNone = card.querySelector("[data-select-none]");

    btnAll && btnAll.addEventListener("click", () => setAll(card, true));
    btnNone && btnNone.addEventListener("click", () => setAll(card, false));
  });
})();
`;

function renderIndexHtml({ groups, validatedCanonicals }) {
  const datalistOptions = validatedCanonicals
    .map((v) => `<option value="${escapeHtml(v)}"></option>`)
    .join("\n");

  const cards = groups
    .map((g) => {
      const brandsHtml = g.unresolvedBrands
        .map(
          (b) => `
            <label class="brand">
              <input type="checkbox" name="selectedBrands" value="${escapeHtml(b)}" checked />
              <span class="mono">${escapeHtml(b)}</span>
            </label>
          `
        )
        .join("\n");

      return `
      <section class="card" data-card>
        <div class="card-header">
          <div>
            <div class="title">
              <span class="pill">Validated Canonical</span>
              <span class="mono">${escapeHtml(g.keyValidated)}</span>
            </div>
            <div class="meta">
              Unresolved brands: <strong>${g.unresolvedBrands.length}</strong>
              <span class="dot">•</span>
              Total in group: <strong>${g.totalBrands}</strong>
            </div>
          </div>

          <div class="card-controls">
            <button type="button" class="btn secondary" data-select-all>Select all</button>
            <button type="button" class="btn secondary" data-select-none>Select none</button>
          </div>
        </div>

        <form method="POST" action="/approve" class="form">
          <input type="hidden" name="groupKey" value="${escapeHtml(g.keyValidated)}" />

          <div class="row">
            <label class="label">
              Substitute validated canonical (optional)
              <input
                class="input mono"
                name="substituteCanonical"
                value="${escapeHtml(g.substituteDefault)}"
                list="validated-list"
                autocomplete="off"
              />
            </label>

            <div class="hint">
              Pick from validated.csv via autocomplete. If unchanged, selected brands map to <span class="mono">${escapeHtml(
                g.keyValidated
              )}</span>.
            </div>
          </div>

          <div class="brands">
            ${brandsHtml}
          </div>

          <div class="footer">
            <button type="submit" class="btn primary">
              Approve group (write selected → lookup.tsv) & resolve
            </button>
          </div>
        </form>
      </section>
      `;
    })
    .join("\n");

  const emptyState =
    groups.length === 0
      ? `
      <div class="empty">
        <h2>Nothing pending 🎉</h2>
        <p>All groups are resolved or contain only brands already present in the lookup table.</p>
      </div>`
      : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Canonical Group Review</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="header">
    <div>
      <h1>Canonical Group Review</h1>
      <p class="subtle">Showing only groups with at least 1 unresolved brand (not already in lookup.tsv column 1).</p>
      <div class="notice mono">
        AGGREGATED_JSON_PATH=${escapeHtml(CONFIG.AGGREGATED_JSON_PATH)}<br/>
        VALIDATED_CSV_PATH=${escapeHtml(CONFIG.VALIDATED_CSV_PATH)}<br/>
        LOOKUP_TSV_PATH=${escapeHtml(CONFIG.LOOKUP_TSV_PATH)}<br/>
        STATE_PATH=${escapeHtml(CONFIG.STATE_PATH)}
      </div>
    </div>
    <div class="header-actions">
      <a class="link" href="/reset-state" title="Clears resolved groups state only (does not touch lookup.tsv)">Reset state</a>
    </div>
  </header>

  <main class="container">
    ${emptyState}
    ${cards}

    <datalist id="validated-list">
      ${datalistOptions}
    </datalist>
  </main>

  <script src="/app.js"></script>
</body>
</html>`;
}

/** =========================
 * App
 * ========================= */
const app = express();
app.use(express.urlencoded({ extended: true }));

// Serve inline CSS/JS
app.get("/styles.css", (req, res) => {
  res.type("text/css").send(STYLES_CSS);
});
app.get("/app.js", (req, res) => {
  res.type("application/javascript").send(APP_JS);
});

// Cache aggregated + validated for speed (reload on restart)
let aggregatedCache = null;
let validatedCache = null;
function ensureCaches() {
  if (!aggregatedCache) aggregatedCache = loadAggregatedJson(CONFIG.AGGREGATED_JSON_PATH);
  if (!validatedCache) validatedCache = loadValidatedCanonicals(CONFIG.VALIDATED_CSV_PATH);
}

app.get("/", (req, res) => {
  try {
    ensureCaches();

    const lookupBrands = loadLookupBrandsSet(CONFIG.LOOKUP_TSV_PATH);
    const state = loadState(CONFIG.STATE_PATH);

    const groups = computePendingGroups({
      aggregated: aggregatedCache,
      validatedList: validatedCache,
      lookupBrands,
      state,
    });

    res.type("text/html").send(
      renderIndexHtml({
        groups,
        validatedCanonicals: validatedCache,
      })
    );
  } catch (err) {
    res.status(500).type("text/plain").send(String(err && err.stack ? err.stack : err));
  }
});

app.post("/approve", (req, res) => {
  try {
    ensureCaches();

    const { groupKey, substituteCanonical } = req.body;

    let selected = req.body.selectedBrands;
    if (!selected) selected = [];
    if (typeof selected === "string") selected = [selected];

    if (!groupKey || typeof groupKey !== "string") {
      return res.status(400).type("text/plain").send("Missing groupKey");
    }

    const aggregated = aggregatedCache;
    const brandList = aggregated[groupKey];
    if (!Array.isArray(brandList)) {
      return res.status(400).type("text/plain").send("Unknown groupKey");
    }

    // Re-load lookup to filter out any already-resolved brand (col 1)
    const lookupBrands = loadLookupBrandsSet(CONFIG.LOOKUP_TSV_PATH);

    // Only allow selecting brands that:
    // - are in the group
    // - are not already present in lookup column 1
    const allowedSet = new Set(brandList.filter((b) => b && !lookupBrands.has(b)));
    const cleanedSelected = selected.filter((b) => allowedSet.has(b));

    const targetValidated =
      (substituteCanonical && String(substituteCanonical).trim()) || groupKey;

    // Append selected rows to lookup.tsv
    const rowsToWrite = cleanedSelected.map((brand) => ({
      brand,
      validatedBrand: targetValidated,
    }));
    appendLookupRows(CONFIG.LOOKUP_TSV_PATH, rowsToWrite);

    // Mark group resolved so it won't show again
    const state = loadState(CONFIG.STATE_PATH);
    state.resolvedGroups = state.resolvedGroups || {};
    state.resolvedGroups[groupKey] = {
      resolvedAt: new Date().toISOString(),
      substituteCanonical: targetValidated,
      approvedCount: rowsToWrite.length,
    };
    saveState(CONFIG.STATE_PATH, state);

    res.redirect("/");
  } catch (err) {
    res.status(500).type("text/plain").send(String(err && err.stack ? err.stack : err));
  }
});

app.get("/reset-state", (req, res) => {
  // Convenience route: clears resolved groups state only (does not touch lookup.tsv)
  saveState(CONFIG.STATE_PATH, { resolvedGroups: {} });
  res.redirect("/");
});

app.listen(CONFIG.PORT, () => {
  console.log(`✅ App running at http://localhost:${CONFIG.PORT}`);
});