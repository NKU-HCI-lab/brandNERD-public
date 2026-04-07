const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { loadSyncState, checkStatus, sync } = require('./sync');
const config = require('./config.json');

const app = express();
const PORT = 3000;
const API_BASE = config.serverUrl;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API proxy helpers ---
const PUBLIC_KEY = config.publicKey;
const DEBUG = config.debug || false;

async function parseResponse(res, endpoint) {
    const text = await res.text();
    try {
        const data = JSON.parse(text);
        if (DEBUG) console.log(`<-- ${res.status} ${endpoint}`, data);
        return { status: res.status, data };
    } catch {
        console.error(`API returned non-JSON (HTTP ${res.status}) ${endpoint}:`, text);
        return { status: 500, data: { error: 'Server returned invalid response.', raw: text } };
    }
}

async function apiPost(endpoint, body, token = null) {
    if (DEBUG) console.log(`--> POST ${API_BASE}${endpoint}`, body);
    const headers = { 'Content-Type': 'application/json', 'X-Public-Key': PUBLIC_KEY };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    return parseResponse(res, `POST ${endpoint}`);
}

async function apiGet(endpoint, token) {
    if (DEBUG) console.log(`--> GET ${API_BASE}${endpoint}`);
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Public-Key': PUBLIC_KEY },
    });
    return parseResponse(res, `GET ${endpoint}`);
}

// --- Forgot / Reset password (no auth required) ---

app.post('/auth/forgot-password', async (req, res) => {
    try {
        const result = await apiPost('/auth/forgot-password', { email: req.body.email });
        res.status(result.status).json(result.data);
    } catch (err) {
		console.log(err)
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/auth/reset-password', async (req, res) => {
    try {
        const result = await apiPost('/auth/reset-password', {
            token: req.body.token,
            new_password: req.body.new_password,
        });
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

// --- Root redirect ---

app.get('/', (req, res) => {
    res.redirect(req.cookies.token ? '/dashboard' : '/signin');
});

// --- Auth actions ---

app.post('/auth/signup', async (req, res) => {
    try {
        const result = await apiPost('/auth/signup', {
            email: req.body.email,
            password: req.body.password,
        });
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/auth/signin', async (req, res) => {
    try {
        const result = await apiPost('/auth/signin', {
            email: req.body.email,
            password: req.body.password,
        });
        if (result.status === 200 && result.data.token) {
            res.cookie('token', result.data.token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24h
            });
            // Fire-and-forget brands DB sync
            sync(result.data.token).catch(err => console.error('Brands sync error:', err.message));
        }
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/auth/signout', async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            await apiPost('/auth/signout', {}, token);
        } catch (err) {
            // Best-effort: still clear the cookie even if the server call fails
        }
    }
    res.clearCookie('token');
    res.json({ message: 'Signed out.' });
});

// --- User info ---

app.get('/api/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet('/auth/me', token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

// --- Activity tracking ---

app.post('/api/activity', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/activity', { page: req.body.page }, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.get('/api/active-users', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet('/active-users', token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

// --- Admin actions ---

app.get('/api/admin/users', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet('/admin/users', token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/admin/users/approve', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/admin/users/approve', req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/admin/users/role', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/admin/users/role', req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

// --- Canonicals browsing ---

app.get('/api/canonicals', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const qs = new URLSearchParams(req.query).toString();
        const endpoint = '/canonicals' + (qs ? '?' + qs : '');
        const result = await apiGet(endpoint, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.get('/api/canonicals/search', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const qs = new URLSearchParams(req.query).toString();
        const endpoint = '/canonicals/search' + (qs ? '?' + qs : '');
        const result = await apiGet(endpoint, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/bulk-resolve', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/canonicals/bulk-resolve', req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/resolve-update', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/canonicals/resolve-update', req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/aggregate', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost('/canonicals/aggregate', req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.get('/api/canonicals/:id/history', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet(`/canonicals/${req.params.id}/history`, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/:id/history/delete', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost(`/canonicals/${req.params.id}/history/delete`, req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.get('/api/canonicals/:id', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet(`/canonicals/${req.params.id}`, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/:id/validate', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost(`/canonicals/${req.params.id}/validate`, req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.post('/api/canonicals/:id/resolve', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiPost(`/canonicals/${req.params.id}/resolve`, req.body, token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

// --- Brands routes ---

app.get('/api/brands/summary', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await apiGet('/brands/summary', token);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ error: 'Server communication error.' });
    }
});

app.get('/api/brands/sync-status', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const localState = loadSyncState();
        const { action, serverStatus } = await checkStatus(token);
        res.json({ localState, action, serverStatus });
    } catch (err) {
        res.status(500).json({ error: 'Sync status check failed.', details: err.message });
    }
});

app.post('/api/brands/sync', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });
    try {
        const result = await sync(token);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Sync failed.', details: err.message });
    }
});

// --- TSV export from local synced DB ---

const LOCAL_DB_PATH = path.join(__dirname, 'data', 'brands.sqlite');

const EXPORT_QUERIES = {
    original: {
        sql: 'SELECT name, canonical_ID AS ID FROM "00_original"',
        headers: ['name', 'ID'],
        filename: 'original.tsv',
    },
    canonicals: {
        sql: 'SELECT name, ID FROM "01_canonicals"',
        headers: ['name', 'ID'],
        filename: 'canonicals.tsv',
    },
    search_queries: {
        sql: 'SELECT DISTINCT query AS name, ID FROM "02_search_queries"',
        headers: ['name', 'ID'],
        filename: 'search_queries.tsv',
    },
    verified: {
        sql: `SELECT c.name, v.count_verified, v.canonical_ID
              FROM "03_verified" v
              JOIN "01_canonicals" c ON c.ID = v.canonical_ID`,
        headers: ['name', 'count_verified', 'canonical_ID'],
        filename: 'verified.tsv',
    },
    validated: {
        sql: `SELECT c.name, v.is_validated, v.canonical_ID
              FROM "04_validated" v
              JOIN "01_canonicals" c ON c.ID = v.canonical_ID`,
        headers: ['name', 'is_validated', 'canonical_ID'],
        filename: 'validated.tsv',
    },
    similar: {
        sql: `SELECT c1.name AS name1, c2.name AS name2, s.score, s.canonical_ID1, s.canonical_ID2
              FROM "05_similarity_scores" s
              JOIN "01_canonicals" c1 ON c1.ID = s.canonical_ID1
              JOIN "01_canonicals" c2 ON c2.ID = s.canonical_ID2`,
        headers: ['name1', 'name2', 'score', 'canonical_ID1', 'canonical_ID2'],
        filename: 'similar.tsv',
    },
    aggregated: {
        sql: `SELECT cm.name AS main_name, ca.name AS add_name, a.canonical_ID_main, a.canonical_ID_add
              FROM "06_aggregated" a
              JOIN "01_canonicals" cm ON cm.ID = a.canonical_ID_main
              JOIN "01_canonicals" ca ON ca.ID = a.canonical_ID_add
              WHERE a.is_cluster = 1`,
        headers: ['main_name', 'add_name', 'canonical_ID_main', 'canonical_ID_add'],
        filename: 'aggregated.tsv',
    },
    resolved: {
        sql: `SELECT cf.name AS from_name, ct.name AS to_name, r.canonical_ID_from, r.canonical_ID_to
              FROM "07_resolved_brands" r
              JOIN "01_canonicals" cf ON cf.ID = r.canonical_ID_from
              JOIN "01_canonicals" ct ON ct.ID = r.canonical_ID_to`,
        headers: ['from_name', 'to_name', 'canonical_ID_from', 'canonical_ID_to'],
        filename: 'resolved.tsv',
    },
};

app.get('/api/brands/export/:dataset', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    const dataset = req.params.dataset;
    const spec = EXPORT_QUERIES[dataset];
    if (!spec) return res.status(400).json({ error: 'Unknown dataset.' });

    // Ensure synced
    if (!fs.existsSync(LOCAL_DB_PATH)) {
        try { await sync(token); } catch (err) {
            return res.status(500).json({ error: 'DB not synced and sync failed.' });
        }
    }

    try {
        const db = new Database(LOCAL_DB_PATH, { readonly: true });
        const rows = db.prepare(spec.sql).all();
        db.close();

        let tsv = spec.headers.join('\t') + '\n';
        for (const row of rows) {
            tsv += spec.headers.map(h => {
                const v = row[h];
                return v == null ? '' : String(v).replace(/[\t\r\n]/g, ' ');
            }).join('\t') + '\n';
        }

        res.setHeader('Content-Type', 'text/tab-separated-values');
        res.setHeader('Content-Disposition', `attachment; filename="${spec.filename}"`);
        res.send(tsv);
    } catch (err) {
        res.status(500).json({ error: 'Export failed.', details: err.message });
    }
});

// --- Static files (AFTER API routes) ---

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Client running at http://localhost:${PORT}`);
});
