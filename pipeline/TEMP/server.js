const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3001;

const GROUPED_PATH = path.join(__dirname, "grouped.json");
const GROUPED_TEST_PATH = path.join(__dirname, "grouped_test.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------- helpers ----------
async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}

// Atomic-ish write: write temp then rename
async function writeJsonAtomic(filePath, obj) {
  const tmp = filePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2) + "\n", "utf8");
  await fs.rename(tmp, filePath);
}

// Build a set of all brands already aggregated:
// - all canonical keys in grouped.json
// - all aliases in grouped.json arrays
function buildAggregatedSet(grouped) {
  const s = new Set();
  for (const [canonical, aliases] of Object.entries(grouped || {})) {
    if (canonical) s.add(String(canonical));
    for (const a of Array.isArray(aliases) ? aliases : []) {
      if (a) s.add(String(a));
    }
  }
  return s;
}

// Filter grouped_test by removing already-aggregated brands from each tentative group.
// Also drop groups that become empty or trivial (0/1 members).
function filteredTentativeGroups(grouped, groupedTest) {
  const aggregated = buildAggregatedSet(grouped);
  const out = {};

  for (const [tentativeKey, members] of Object.entries(groupedTest || {})) {
    const arr = Array.isArray(members) ? members.map(String) : [];

    // IMPORTANT: also consider the tentativeKey itself as a "member" candidate
    // only if your data needs it. Here we treat it as canonical label for this tentative group.
    // We filter the member list only, and if the key itself is already aggregated,
    // we still allow approving as long as remaining members exist (we will merge into existing canonical).
    const filtered = arr.filter((m) => !aggregated.has(m));

    // Drop groups that have no remaining items (or only 1 item if you consider that not useful)
    if (filtered.length >= 1) {
      out[tentativeKey] = filtered;
    }
  }

  return out;
}

// Merge approved group into grouped.json:
// - If canonical already exists, append new unique aliases.
// - If canonical does not exist, create it with the approved members.
function mergeIntoGrouped(grouped, canonical, approvedMembers) {
  const next = { ...(grouped || {}) };

  const existing = Array.isArray(next[canonical]) ? next[canonical].map(String) : [];
  const set = new Set(existing);

  for (const m of approvedMembers) {
    if (!m) continue;

    // Do not add canonical as its own alias
    if (String(m) === String(canonical)) continue;

    set.add(String(m));
  }

  next[canonical] = Array.from(set).sort();
  return next;
}

// Remove the group from grouped_test.json (whether approved or rejected)
function removeFromGroupedTest(groupedTest, canonical) {
  const next = { ...(groupedTest || {}) };
  delete next[canonical];
  return next;
}

function removeSelectedFromGroup(groupedTest, canonical, selectedBrands) {
  const next = { ...(groupedTest || {}) };
  const arr = Array.isArray(next[canonical]) ? next[canonical].map(String) : [];
  const selectedSet = new Set(selectedBrands.map(String));
  const remaining = arr.filter((b) => !selectedSet.has(String(b)));

  if (remaining.length === 0) {
    delete next[canonical];
  } else {
    next[canonical] = remaining;
  }
  return next;
}
// ---------- routes ----------
app.get("/", async (req, res) => {
  const grouped = await readJson(GROUPED_PATH, {});
  const groupedTest = await readJson(GROUPED_TEST_PATH, {});
  const displayGroupsObj = filteredTentativeGroups(grouped, groupedTest);

  // Convert to sortable array
  const displayGroups = Object.entries(displayGroupsObj)
    .map(([canonical, members]) => ({
      canonical,
      members,
      count: members.length
    }))
    .sort((a, b) => b.count - a.count); // DESCENDING

  res.render("index", {
    displayGroups,
    stats: {
      groupedCount: Object.keys(grouped).length,
      tentativeCount: Object.keys(groupedTest).length,
      displayCount: displayGroups.length
    }
  });
});

// Return current filtered groups as JSON (for refresh without full reload if desired)
app.get("/api/groups", async (req, res) => {
  const grouped = await readJson(GROUPED_PATH, {});
  const groupedTest = await readJson(GROUPED_TEST_PATH, {});
  const displayGroups = filteredTentativeGroups(grouped, groupedTest);
  res.json({ groups: displayGroups });
});

app.post("/api/groups/:canonical/approve", async (req, res) => {
  const canonical = req.params.canonical;

  const grouped = await readJson(GROUPED_PATH, {});
  const groupedTest = await readJson(GROUPED_TEST_PATH, {});

  if (!Object.prototype.hasOwnProperty.call(groupedTest, canonical)) {
    return res.status(404).json({ ok: false, error: "Group not found in grouped_test.json" });
  }

  // Re-filter against current grouped.json to prevent approving already-aggregated brands
  const displayGroups = filteredTentativeGroups(grouped, groupedTest);
  const allowed = displayGroups[canonical] || [];

  let selected = Array.isArray(req.body?.brands) ? req.body.brands.map(String) : [];

// Requirement: if empty/missing, approve ALL eligible brands in this group
if (selected.length === 0) {
  selected = allowed;
}

  // Validate selection is a subset of currently allowed (filtered) members
  const allowedSet = new Set(allowed.map(String));
  const approvedMembers = selected.filter((b) => allowedSet.has(String(b)));

  if (approvedMembers.length === 0) {
    return res.status(400).json({ ok: false, error: "Selected brands are not eligible (possibly already aggregated)" });
  }

  const nextGrouped = mergeIntoGrouped(grouped, canonical, approvedMembers);

  // Remove ONLY the approved ones from grouped_test; keep remaining for later review
  const nextGroupedTest = removeSelectedFromGroup(groupedTest, canonical, approvedMembers);

  await writeJsonAtomic(GROUPED_PATH, nextGrouped);
  await writeJsonAtomic(GROUPED_TEST_PATH, nextGroupedTest);

  // Compute remaining count for UI convenience (filtered view will also remove any newly aggregated ones)
  const afterDisplay = filteredTentativeGroups(nextGrouped, nextGroupedTest);
  const remainingMembers = afterDisplay[canonical] || [];

  res.json({
    ok: true,
    canonical,
    mergedCount: approvedMembers.length,
    approved: approvedMembers,
    remainingCount: remainingMembers.length,
    remainingMembers
  });
});

// Reject a tentative group:
// - remove from grouped_test.json only
app.post("/api/groups/:canonical/reject", async (req, res) => {
  const canonical = req.params.canonical;

  const groupedTest = await readJson(GROUPED_TEST_PATH, {});
  if (!Object.prototype.hasOwnProperty.call(groupedTest, canonical)) {
    return res.status(404).json({ ok: false, error: "Group not found in grouped_test.json" });
  }

  const nextGroupedTest = removeFromGroupedTest(groupedTest, canonical);
  await writeJsonAtomic(GROUPED_TEST_PATH, nextGroupedTest);

  res.json({ ok: true, canonical });
});

app.listen(PORT, () => {
  console.log(`Brand approver running on http://localhost:${PORT}`);
});