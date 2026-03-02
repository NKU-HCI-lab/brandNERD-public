function getAllBrands(card) {
  return Array.from(card.querySelectorAll(".chip"))
    .map((b) => b.dataset.brand)
    .filter(Boolean);
}

function getSelectedBrands(card) {
  return Array.from(card.querySelectorAll(".chip.selected"))
    .map((b) => b.dataset.brand)
    .filter(Boolean);
}
function updateMeta(card) {
  const count = card.querySelectorAll(".chip").length;
  const meta = card.querySelector(".meta");
  if (meta) meta.textContent = `${count} remaining candidate(s)`;
}

function setCollapsed(card, msg) {
  card.classList.add("processed");
  const status = card.querySelector(".status");
  if (status) status.textContent = msg;
  setTimeout(() => card.classList.add("collapsed"), 350);
}

async function postAction(canonical, action, body) {
  const res = await fetch(`/api/groups/${encodeURIComponent(canonical)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data?.error || `Request failed (${res.status})`;
    throw new Error(err);
  }
  return data;
}

document.addEventListener("click", async (e) => {
  // Toggle brand chip selection
  const chip = e.target.closest(".chip");
  if (chip) {
    chip.classList.toggle("selected");
    const card = chip.closest(".card");
    const approveBtn = card.querySelector('button[data-action="approve"]');
    if (approveBtn) {
  approveBtn.disabled = false; // never disable; none selected means approve all
}
    return;
  }

  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const card = btn.closest(".card");
  const canonical = card?.dataset?.canonical;
  const action = btn.dataset.action; // approve | reject
  if (!canonical || !action) return;

  const status = card.querySelector(".status");
  if (status) {
    status.classList.remove("error");
    status.textContent = "";
  }

  // Prevent double clicks while processing
  card.classList.add("busy");
  card.querySelectorAll("button").forEach((b) => (b.disabled = true));

  try {
    if (action === "approve") {
      let selected = getSelectedBrands(card);

// Requirement: if user doesn't select any, approve ALL
if (selected.length === 0) {
  selected = getAllBrands(card);
}

const data = await postAction(canonical, "approve", { brands: selected });

      // Remove approved chips from the UI
      const approvedSet = new Set((data.approved || []).map(String));
      card.querySelectorAll(".chip").forEach((c) => {
        if (approvedSet.has(String(c.dataset.brand))) {
          c.closest("li")?.remove();
        }
      });

      // Clear any selection states
      card.querySelectorAll(".chip.selected").forEach((c) => c.classList.remove("selected"));

      // Update counts + status
      updateMeta(card);

      if ((data.remainingCount ?? card.querySelectorAll(".chip").length) === 0) {
        setCollapsed(card, `Approved ${data.mergedCount ?? 0}. Group complete.`);
      } else {
        if (status) status.textContent = `Approved ${data.mergedCount ?? 0}. ${data.remainingCount} still left in this group.`;

        // Re-enable buttons: approve only enabled if selection exists
        const approveBtn = card.querySelector('button[data-action="approve"]');
        const rejectBtn = card.querySelector('button[data-action="reject"]');
        if (approveBtn) approveBtn.disabled = true; // no selection after clearing
        if (rejectBtn) rejectBtn.disabled = false;
        card.classList.remove("busy");
      }
    } else {
      // reject = remove entire group
      await postAction(canonical, "reject");
      setCollapsed(card, "Rejected. Removed from tentative list.");
    }
  } catch (err) {
    card.classList.remove("busy");
    // Re-enable reject always; enable approve if selection exists
    const approveBtn = card.querySelector('button[data-action="approve"]');
    const rejectBtn = card.querySelector('button[data-action="reject"]');
    if (rejectBtn) rejectBtn.disabled = false;
    if (approveBtn) approveBtn.disabled = getSelectedBrands(card).length === 0;

    if (status) {
      status.textContent = `Error: ${err.message}`;
      status.classList.add("error");
    }
  }
});

// On page load: disable Approve Selected until something is selected
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach((card) => {
    // Select all chips initially
    card.querySelectorAll(".chip").forEach((chip) => chip.classList.add("selected"));

    // Approve should be enabled because everything is selected
    const approveBtn = card.querySelector('button[data-action="approve"]');
    if (approveBtn) approveBtn.disabled = false;
  });
});