const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'brands.sqlite');
const STATE_PATH = path.join(DATA_DIR, 'sync_state.json');
const config = require('./config.json');
const API_BASE = config.serverUrl;
const PUBLIC_KEY = config.publicKey;

function loadSyncState() {
    try {
        if (fs.existsSync(STATE_PATH)) {
            return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
        }
    } catch (err) {
        console.error('Failed to read sync state:', err.message);
    }
    return null;
}

function saveSyncState(serverStatus) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const state = {
        synced_at: new Date().toISOString(),
        file_size: serverStatus.file_size,
        file_mtime: serverStatus.file_mtime,
        tables: serverStatus.tables,
    };
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    return state;
}

async function checkStatus(token) {
    const res = await fetch(`${API_BASE}/brands/status`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Public-Key': PUBLIC_KEY },
    });
    if (!res.ok) {
        throw new Error(`Status check failed: ${res.status}`);
    }
    const serverStatus = await res.json();
    const localState = loadSyncState();

    // No local DB → full download
    if (!localState || !fs.existsSync(DB_PATH)) {
        return { action: 'full_download', serverStatus, localState };
    }

    // Compare each table
    let needsDiff = false;
    for (const [table, serverInfo] of Object.entries(serverStatus.tables)) {
        const localInfo = localState.tables?.[table];
        if (!localInfo) {
            return { action: 'full_download', serverStatus, localState };
        }
        // Server has fewer rows (deletions) → full download
        if (serverInfo.count < localInfo.count) {
            return { action: 'full_download', serverStatus, localState };
        }
        // Server has new rows → diff needed
        if (serverInfo.max_rowid > localInfo.max_rowid) {
            needsDiff = true;
        }
        // Count grew more than rowid difference suggests → ambiguous, full download
        if (serverInfo.count - localInfo.count > serverInfo.max_rowid - localInfo.max_rowid) {
            return { action: 'full_download', serverStatus, localState };
        }
    }

    if (needsDiff) {
        return { action: 'diff', serverStatus, localState };
    }

    return { action: 'none', serverStatus, localState };
}

async function fullDownload(token, serverStatus) {
    const res = await fetch(`${API_BASE}/brands/download`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Public-Key': PUBLIC_KEY },
    });
    if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(DB_PATH, buffer);

    return saveSyncState(serverStatus);
}

async function applyDiff(token, serverStatus, localState) {
    // Build payload with local max_rowids
    const tables = {};
    for (const [table, info] of Object.entries(localState.tables)) {
        tables[table] = { max_rowid: info.max_rowid };
    }

    const res = await fetch(`${API_BASE}/brands/diff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Public-Key': PUBLIC_KEY,
        },
        body: JSON.stringify({ tables }),
    });
    if (!res.ok) {
        throw new Error(`Diff request failed: ${res.status}`);
    }

    const { diff } = await res.json();

    // Insert rows into local DB; fall back to full download on schema mismatch
    const db = new Database(DB_PATH);
    try {
        for (const [table, rows] of Object.entries(diff)) {
            if (!rows.length) continue;
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            try {
                const insert = db.prepare(
                    `INSERT OR REPLACE INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`
                );
                const tx = db.transaction((rows) => {
                    for (const row of rows) {
                        insert.run(...columns.map(c => row[c]));
                    }
                });
                tx(rows);
            } catch (err) {
                if (err.message && err.message.includes('has no column named')) {
                    console.log(`Brands sync: schema mismatch on "${table}", falling back to full download...`);
                    db.close();
                    return fullDownload(token, serverStatus);
                }
                throw err;
            }
        }
    } finally {
        if (db.open) db.close();
    }

    return saveSyncState(serverStatus);
}

async function sync(token) {
    const { action, serverStatus, localState } = await checkStatus(token);

    if (action === 'full_download') {
        console.log('Brands sync: performing full download...');
        const state = await fullDownload(token, serverStatus);
        console.log('Brands sync: full download complete.');
        return { action, state };
    }

    if (action === 'diff') {
        console.log('Brands sync: applying diff...');
        const state = await applyDiff(token, serverStatus, localState);
        console.log('Brands sync: diff applied.');
        return { action, state };
    }

    console.log('Brands sync: already up to date.');
    const state = saveSyncState(serverStatus);
    return { action: 'none', state };
}

module.exports = { loadSyncState, checkStatus, sync };
