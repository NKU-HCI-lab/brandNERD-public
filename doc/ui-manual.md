# Brand Canonicals Platform — User Manual

## Table of Contents

1. [Setup and Installation](#1-setup-and-installation)
2. [Authentication](#2-authentication)
3. [Dashboard](#3-dashboard)
4. [Browsing Canonicals](#4-browsing-canonicals)
5. [Canonical Detail Panel](#5-canonical-detail-panel)
6. [Validating Brands](#6-validating-brands)
7. [Aggregating Brands](#7-aggregating-brands)
8. [Resolving Brands](#8-resolving-brands)
9. [History and Deletion](#9-history-and-deletion)
10. [Downloading Data](#10-downloading-data)
11. [Database Sync](#11-database-sync)
12. [Administration](#12-administration)

---

## 1. Setup and Installation

### Prerequisites

- **Node.js** (v18 or later recommended)
- **PHP server** (e.g., XAMPP Apache) running and serving the `server/` folder
- The brands SQLite database already built (via `node utils/rebuild_db.js`)

### Configuration

Edit `client/config.json` to point to your PHP server API:

```json
{
  "serverUrl": "http://localhost/research/bidfta-crowdfunding/server/api"
}
```

Change `serverUrl` if your PHP server runs on a different host, port, or path.

### Install and Run

```bash
cd client
npm install
npm start
```

The client starts on **http://localhost:3000**. Open this URL in a browser.

---

## 2. Authentication

### Creating an Account

1. Open `http://localhost:3000`. You are redirected to the **Sign In** page.
2. Click **Sign up** at the bottom of the form.
3. Enter your email, a password (6 characters minimum), and confirm it.
4. Click **Sign Up**. A success message confirms your account was created.
5. Your account is now **pending approval**. An administrator must approve it before you can sign in.

### Signing In

1. Go to the **Sign In** page.
2. Enter your email and password, then click **Sign In**.
3. If your account is approved, you are redirected to the **Dashboard**. If it is still pending or has been denied, an error message is shown.

### Signing Out

Click **Menu** in the top-right corner of any page and select **Sign Out**. You are redirected to the Sign In page.

---

## 3. Dashboard

The Dashboard is the landing page after signing in. It provides an overview of the datasets and quick navigation.

### User Profile

At the top, you see your email address, your role (User or Administrator), and the date you joined.

### Dataset Summary

Summary cards are organized in rows. Each card shows:

- **Original** — Number of surface-form name rows in the dataset.
- **Canonicals** — Total canonical brands, and how many were user-added.
- **Web Search** — Number of distinct canonicals that have been searched, and the number of search queries.
- **Verified** — How many canonical-domain pairs have been verified (with yes/no breakdown).
- **Validated** — How many canonicals have been validated by users (with valid/invalid breakdown).
- **Similar** — Number of scored similarity pairs.
- **Aggregated** — Number of distinct cluster members.
- **Resolved** — Number of distinct source brands that have been resolved to another.

Each card has a **download button** (see [Downloading Data](#10-downloading-data)).

### Navigation

- **Canonicals Index** — Opens the main data browsing interface.
- **Admin Panel** — Visible only to administrators. Opens the user management panel.

---

## 4. Browsing Canonicals

Open the **Canonicals Index** page from the Dashboard. This is where you browse, search, and work with brand canonicals.

### The Table

The table shows one row per canonical with the following columns:

| Column | Description |
|---|---|
| **ID** | Internal identifier |
| **Name** | Canonical brand name |
| **Searched** | Total web search results found across all queries |
| **Verified** | Total count of verified domain hits |
| **Validated** | Average user validation score |
| **Similar** | Number of similar canonicals (by similarity score) |
| **Clusters** | Number of aggregation cluster memberships |
| **Added** | Whether this canonical was user-added (1) or original (0) |
| **Resolved** | Resolution status: **R->** (resolves to another), **->R** (another resolves to it), **R<->R** (both) |

### Searching

Type a name (or part of a name) in the search box and click **Search** or press Enter. Only canonicals whose name contains the search text are shown. Click **Clear** to reset the search.

### Sorting

Click any column header to sort by that column. Click again to toggle between ascending and descending order. An arrow indicator shows the active sort direction.

### Pagination

At the bottom of the table:

- Choose how many rows per page: **25**, **50**, or **100**.
- Navigate with **First**, **Prev**, **Next**, **Last** buttons.
- The current range and total count are displayed (e.g., "1-25 of 369,694 (page 1/14,788)").

### Opening a Canonical

Click any row to open its detail panel.

- **On desktop** (screen width 992px or wider): The detail panel opens to the right of the table. You can continue browsing the table while viewing details.
- **On mobile** (narrower screens): You are taken to a full-page detail view. Use the **Back** link to return to the table.

---

## 5. Canonical Detail Panel

The detail panel shows comprehensive information about a single canonical, organized in sections from top to bottom.

### ID

The canonical's internal identifier.

### Surface Names

The raw brand name strings from the original dataset that map to this canonical. Shows the total count and lists each name.

### Search Results

Web search queries that included this canonical, and how many results were found for each query. A **Google** button at the bottom lets you quickly search for the brand: the input is pre-filled with the canonical name and you can modify it before clicking.

### Verified

A table of domains where this canonical was found during web verification. Each row shows:

- **Domain** — The website domain (e.g., amazon.com).
- **Count** — How many verified hits on that domain.
- **Search icon** — A small button that opens a Google search for "{brand name} {domain}" in a new tab, so you can quickly check the brand on that domain.

The section header shows the total verified count across all domains.

### Validation

Shows how many users have marked this canonical as Valid or Invalid. Below the table are two buttons:

- **Valid** (green) — Mark this canonical as a valid brand.
- **Invalid** (red) — Mark this canonical as not a valid brand.

Your vote is recorded with your user ID and the current date. If you have already voted, clicking again updates your vote. See [Validating Brands](#6-validating-brands) for more detail.

### Similarity

A list of canonicals that are semantically similar to the current one, sorted by similarity score (highest first). The current canonical is listed at the top (with a radio button and a score of "-").

Each similar canonical has:

- A **checkbox** for selection (or radio button for the current canonical).
- A **clickable name** that loads that canonical's detail.
- A **similarity score**.

Two toggle options appear:

- **Hide aggregated** — Hides non-validated canonicals that are already part of an aggregation cluster. The count of hidden items is shown.
- **Hide resolved** — Hides canonicals that have already been resolved.

Below the table are controls for **Aggregate** and **Resolve** actions (see sections 7 and 8).

### Aggregation

Shows which cluster this canonical belongs to. Two perspectives:

- **As Main** — Canonicals that are members of a cluster where this canonical is the main/parent.
- **As Add** — Clusters where this canonical is a member of another canonical's group.

Each row shows the Member name, the Main name, and a count. Names are clickable.

### Resolution

Shows resolution mappings:

- **Resolves to** — Other canonicals that this one redirects to.
- **Resolved from** — Other canonicals that redirect to this one.

Each row shows the From name, the To name, and a count. Names are clickable.

---

## 6. Validating Brands

Validation is how you indicate whether a canonical represents a real, valid brand.

### How to Validate

1. Open a canonical's detail panel.
2. Scroll to the **Validation** section.
3. Click **Valid** (green button) if the canonical is a legitimate brand, or **Invalid** (red button) if it is not.
4. The panel refreshes to show the updated validation counts.

### What Happens

- A record is created (or updated) in the database linking your user ID, the canonical, and your vote (+1 for valid, -1 for invalid).
- Each user can only have one vote per canonical. Clicking again changes your vote.
- The **Validated** column in the canonicals table shows the average vote across all users.

---

## 7. Aggregating Brands

Aggregation groups related canonicals into clusters. For example, "ACME", "ACME INC", and "ACME CORPORATION" might all be aggregated under a single main canonical.

### Aggregating from the Similarity Section

This is the primary workflow for aggregation:

1. Open a canonical's detail panel.
2. In the **Similarity** section, review the list of similar brands.
3. **Check the boxes** next to the canonicals you want to group together.
4. **Choose the main canonical** — the one the others should be grouped under:
   - Use the **radio button** to select the current canonical or one of the similar ones as the main, OR
   - Type a different canonical name in the **autocomplete input** below the table. Suggestions appear as you type.
5. Click the **Aggregate** button.
6. The selected canonicals are added as members of the main canonical's cluster.

### Tips

- Use the **Select All** checkbox to quickly select all similar canonicals.
- The **hide aggregated** toggle helps you focus on canonicals that haven't been grouped yet.
- After aggregating, the detail panel refreshes and the newly aggregated items appear in the Aggregation section.

---

## 8. Resolving Brands

Resolution establishes that one canonical should be treated as equivalent to (or replaced by) another. It is a directional mapping: canonical A "resolves to" canonical B.

### Resolving from the Similarity Section (Combined Aggregate + Resolve)

This is the most common workflow. It aggregates and resolves in a single action:

1. In the **Similarity** section, check the canonicals you want to resolve.
2. Choose the target canonical (the one they should resolve to) using the radio button or the **Resolve** autocomplete input.
3. Click the **Resolve** button below the autocomplete input.
4. The selected canonicals are both aggregated under and resolved to the target.

### Bulk Resolving from the Aggregation Section

If canonicals are already aggregated but not yet resolved:

1. In the **Aggregation** section, check the rows you want to resolve.
2. Type the target canonical name in the autocomplete input.
3. Click **Resolve**.
4. All checked members are resolved to the specified target.

### Resolving from the Resolution Section

To add a new resolution mapping directly:

1. Scroll to the bottom of the **Resolution** section.
2. Type or search for the target canonical name in the autocomplete input.
3. Click **Resolve**.
4. A resolution record is created: the current canonical resolves to the one you specified.

### Understanding Resolution Status in the Table

In the canonicals index table, the **Resolved** column shows:

- **R->** — This canonical resolves to another (it is a source).
- **->R** — Another canonical resolves to this one (it is a target).
- **R<->R** — This canonical is both a source and a target in different resolution mappings.
- *(empty)* — No resolution mappings exist for this canonical.

---

## 9. History and Deletion

Every action (validation, aggregation, resolution) is recorded with a timestamp and user ID. You can review and selectively delete these records.

### Viewing History

1. Open a canonical's detail panel.
2. Click the **Show history** button at the top of the panel.
3. The regular view is replaced by a history view showing raw database records organized by type:
   - **Insertion** — When and by whom this canonical was added (if user-added).
   - **Validation** — Every validation vote, with date, user, and status.
   - **Aggregation** — Every cluster membership record, with main/member names, date, and user.
   - **Resolution** — Every resolution mapping, with from/to names, date, and user.
4. Click **Hide history** to return to the regular view.

### Deleting Records

Each history row has a checkbox. To delete records:

1. Check the rows you want to remove.
2. Click the **Delete selected** button for that section.
3. Confirm the action in the dialog.

**Permissions:**

- You can delete records **you created** (where the user ID matches yours).
- **Administrators** can delete any record, regardless of who created it.
- Rows you cannot delete do not have a checkbox.

**Special case — Deleting an Insertion:** If you delete the insertion record of a user-added canonical, the **entire canonical is permanently removed** from the database. A warning is shown before proceeding.

---

## 10. Downloading Data

### From the Dashboard

Each dataset summary card has a download button (arrow icon). Clicking it downloads a **TSV file** (tab-separated values) that you can open in Excel, Google Sheets, or any text editor.

Available downloads:

| Dataset | File | Contents |
|---|---|---|
| Original | `original.tsv` | Surface-form names with their canonical ID |
| Canonicals | `canonicals.tsv` | Canonical names with their ID |
| Web Search | `search_queries.tsv` | Distinct search queries with their ID |
| Verified | `verified.tsv` | Canonical names with verified count and ID |
| Validated | `validated.tsv` | Canonical names with validation status and ID |
| Similar | `similar.tsv` | Pairs of similar canonicals with scores and IDs |
| Aggregated | `aggregated.tsv` | Pairs of main/member canonicals with IDs |
| Resolved | `resolved.tsv` | Pairs of from/to canonicals with IDs |

All TSV files include column headers in the first row.

### How Downloads Work

Downloads are generated from the **local copy** of the brands database, not directly from the server. This means:

1. The database must be synced before downloading. If it is not synced yet, the system triggers a sync automatically.
2. Downloads are fast because they read from a local file, not from the network.
3. The data reflects the state at the time of the last sync. If other users made changes since your last sync, those changes won't appear until you sync again.

---

## 11. Database Sync

The platform maintains a local copy of the brands database on your machine for fast browsing and data exports. This local copy is kept in sync with the server.

### When Does Sync Happen?

- **Automatically on sign-in.** Every time you sign in, a background sync starts.
- **Automatically on Dashboard load.** If the local database is missing or outdated, a sync is triggered when you open the Dashboard.
- **Manually.** Click the **Sync** button in the header of the Canonicals Index page.
- **Before downloads.** If the database is not synced, a sync runs before generating a TSV file.

### How Sync Works

1. **First sync** — The entire database file (~48 MB) is downloaded from the server.
2. **Subsequent syncs** — The client compares local and server table row counts and maximum row IDs. If only new rows were added, it downloads just the new rows (incremental diff). If rows were deleted or the data is ambiguous, a full re-download occurs.

### Sync Status Indicator

In the header of the Dashboard and Canonicals Index pages, you see one of:

- **DB synced: Xm ago** — The database was successfully synced X minutes ago.
- **DB synced: Xh ago** — The database was synced X hours ago.
- **DB: not synced** — No local database exists yet.
- **DB: syncing...** — A sync is currently in progress.

The status updates every 30 seconds.

### Important Notes

- Changes you make (validation, aggregation, resolution) are sent to the **server** immediately. They will appear in your local database after the next sync.
- If multiple users are working simultaneously, sync your database regularly to see their changes.
- The local database is stored in `client/data/` and is excluded from version control.

---

## 12. Administration

Administrators (users with role = 10) have access to the **Admin Panel**.

### Accessing the Admin Panel

From the Dashboard, click **Admin Panel**. This link is only visible to administrators.

### Managing Users

The Admin Panel shows a table of all registered users with:

- **ID** — User identifier.
- **Email** — The user's email address.
- **Role** — User or Administrator.
- **Status** — Pending (yellow), Approved (green), or Denied (red).
- **Created** — When the account was created.
- **Actions** — Approve or Deny buttons.

### Approving and Denying Users

- Click **Approve** on a pending or denied user to grant them access.
- Click **Deny** on an approved or pending user to revoke their access.
- Denied users cannot sign in until re-approved.

### Active Users

The header of every authenticated page shows the count of currently active users. A user is considered active if they have interacted with the platform within the last hour. This count updates every 30 seconds.
