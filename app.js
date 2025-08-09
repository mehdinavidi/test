
/* AEMP Pack-Demo – Login + Bilder + Lightbox + History */
const USERS = new Set(["ips-1","ips-2","ips-3","ips-4","ips-5"]);
const PASS = "bilder";

const DATA = {
  sets: [
    { id: 1, code: "ACH-101", name: "Standard-OP Set", department: "Chirurgie",
      image_url: "https://via.placeholder.com/320x200?text=ACH-101" },
    { id: 2, code: "ACH-102", name: "Laparoskopie Set", department: "Chirurgie",
      image_url: "https://via.placeholder.com/320x200?text=ACH-102" },
    { id: 3, code: "ACH-103", name: "Orthopädie Standard", department: "Ortho",
      image_url: "https://via.placeholder.com/320x200?text=ACH-103" }
  ],
  instruments: [
    { id: 1, code: "INST-1", name: "Skalpellgriff Nr. 4", category: "Schneiden",
      image_url: "https://via.placeholder.com/600x400?text=Skalpellgriff+4" },
    { id: 2, code: "INST-2", name: "Schere Metzenbaum 14 cm", category: "Schneiden",
      image_url: "https://via.placeholder.com/600x400?text=Metzenbaum+14cm" },
    { id: 3, code: "INST-3", name: "Pinzette anatomisch 14 cm", category: "Greifen",
      image_url: "https://via.placeholder.com/600x400?text=Pinzette+14cm" },
    { id: 4, code: "INST-4", name: "Klemme Kocher gebogen", category: "Klemmen",
      image_url: "https://via.placeholder.com/600x400?text=Kocher+gebogen" },
    { id: 5, code: "INST-5", name: "Nadelhalter Mayo-Hegar 16 cm", category: "Halten/Nähen",
      image_url: "https://via.placeholder.com/600x400?text=Mayo-Hegar+16cm" },
    { id: 6, code: "INST-6", name: "Tuchklemme", category: "Fixieren",
      image_url: "https://via.placeholder.com/600x400?text=Tuchklemme" }
  ],
  setInstruments: [
    { set_id: 1, instrument_id: 1, qty_required: 2 },
    { set_id: 1, instrument_id: 2, qty_required: 1 },
    { set_id: 1, instrument_id: 3, qty_required: 2 },
    { set_id: 1, instrument_id: 4, qty_required: 2 },
    { set_id: 1, instrument_id: 5, qty_required: 1 },
    { set_id: 2, instrument_id: 1, qty_required: 1 },
    { set_id: 2, instrument_id: 3, qty_required: 2 },
    { set_id: 2, instrument_id: 4, qty_required: 2 },
    { set_id: 2, instrument_id: 6, qty_required: 4 },
    { set_id: 3, instrument_id: 1, qty_required: 1 },
    { set_id: 3, instrument_id: 2, qty_required: 2 },
    { set_id: 3, instrument_id: 4, qty_required: 3 },
    { set_id: 3, instrument_id: 5, qty_required: 1 }
  ]
};

const MISSING_REASONS = ["Reparatur", "Verlust", "in Steri", "Sonstiges"];

// ----- Storage helpers -----
const KEY_SESSIONS = "aemp_demo_sessions_v2";
const KEY_USER = "aemp_demo_user";

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(KEY_SESSIONS) || "{}"); }
  catch { return {}; }
}
function saveSessions(s) { try { localStorage.setItem(KEY_SESSIONS, JSON.stringify(s)); } catch(e) {} }
function resetSessions() { try { localStorage.removeItem(KEY_SESSIONS); } catch(e) {} }

function getUser() {
  try { return JSON.parse(localStorage.getItem(KEY_USER) || "null"); } catch { return null; }
}
function setUser(u) { try { localStorage.setItem(KEY_USER, JSON.stringify(u)); } catch(e) {} }
function logoutUser() { try { localStorage.removeItem(KEY_USER); } catch(e) {} }

// ----- DOM refs -----
const setListEl = document.getElementById("setList");
const detailsEl = document.getElementById("details");
const searchEl = document.getElementById("search");
const resetBtn = document.getElementById("resetData");
const userBox = document.getElementById("userBox");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// Modal
const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelPack = document.getElementById("cancelPack");
const savePack = document.getElementById("savePack");

// Lightbox
const lbBackdrop = document.getElementById("lightboxBackdrop");
const lbImg = document.getElementById("lightboxImg");
const lbCaption = document.getElementById("lightboxCaption");
const lbClose = document.getElementById("lightboxClose");

// Login
const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");

let selectedSetId = null;

// ----- Auth -----
function requireLogin() {
  const u = getUser();
  if (!u) {
    loginOverlay.classList.remove("hidden");
    userBox.classList.add("hidden");
  } else {
    loginOverlay.classList.add("hidden");
    userBox.classList.remove("hidden");
    userNameEl.textContent = u.username;
  }
  renderSetList(searchEl.value || "");
  renderDetails();
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = (loginUser.value || "").trim().toLowerCase();
  const pass = loginPass.value || "";
  if (!USERS.has(username) || pass !== PASS) {
    alert("Ungültige Zugangsdaten. Demo: ips-1 … ips-5 / bilder");
    return;
  }
  setUser({ username });
  loginOverlay.classList.add("hidden");
  userBox.classList.remove("hidden");
  userNameEl.textContent = username;
  renderSetList(searchEl.value || "");
  renderDetails();
});

logoutBtn.addEventListener("click", () => {
  logoutUser();
  selectedSetId = null;
  requireLogin();
});

// ----- Lightbox helpers -----
function openLightbox(src, caption = "") {
  lbImg.src = src;
  lbCaption.textContent = caption;
  lbBackdrop.classList.add("show");
}
function closeLightbox() {
  lbBackdrop.classList.remove("show");
  lbImg.src = "";
  lbCaption.textContent = "";
}
lbBackdrop.addEventListener("click", (e) => {
  if (e.target === lbBackdrop) closeLightbox();
});
lbClose.addEventListener("click", closeLightbox);

// ----- Sets & Instruments helpers -----
function getSetById(id) { return DATA.sets.find(s => s.id === id); }
function getSetLines(setId) {
  return DATA.setInstruments
    .filter(si => si.set_id === setId)
    .map(si => ({
      ...si,
      instrument: DATA.instruments.find(i => i.id === si.instrument_id)
    }));
}

function computeSetStatus(setId) {
  const sessions = loadSessions();
  const s = sessions[setId];
  if (!s) return { label: "neu", cls: "" };
  if (s.closed_at) {
    const hasMissing = s.lines.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
    return { label: hasMissing ? "Abgeschlossen (Fehlteile)" : "Abgeschlossen", cls: hasMissing ? "bad" : "good" };
  }
  return { label: "in Arbeit", cls: "warn" };
}

// ----- Render set list -----
function renderSetList(filter = "") {
  const q = filter.trim().toLowerCase();
  setListEl.innerHTML = "";
  DATA.sets
    .filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .forEach(s => {
      const item = document.createElement("div");
      item.className = "item" + (s.id === selectedSetId ? " active" : "");
      const status = computeSetStatus(s.id);
      item.innerHTML = `
        <img class="thumb" src="${s.image_url}" alt="${s.code} Bild" />
        <div>
          <div class="title">${s.code} – ${s.name}</div>
          <span class="meta">${s.department}</span>
        </div>
        <div><span class="badge ${status.cls}">${status.label}</span></div>
      `;
      item.addEventListener("click", () => { selectedSetId = s.id; renderSetList(q); renderDetails(); });
      setListEl.appendChild(item);
    });
}

// ----- Render details -----
function renderDetails() {
  if (!selectedSetId) {
    detailsEl.innerHTML = '<div class="placeholder"><h2>Wähle links ein Set aus</h2><p>Dann siehst du hier die Details und kannst den Packvorgang starten.</p></div>';
    return;
  }
  const s = getSetById(selectedSetId);
  const lines = getSetLines(selectedSetId);
  const sessions = loadSessions();
  const cur = sessions[selectedSetId];
  const status = computeSetStatus(selectedSetId);

  const tableRows = lines.map(l => `
    <tr>
      <td><img class="ithumb" src="${l.instrument.image_url}" alt="${l.instrument.name}"
               title="Zum Vergrößern anklicken"
               data-zoom-src="${l.instrument.image_url}" data-caption="${l.instrument.name}" /></td>
      <td>${l.instrument.name}</td>
      <td class="qty">${l.qty_required}</td>
      <td>${l.instrument.code}</td>
      <td>${l.instrument.category}</td>
    </tr>
  `).join("");

  detailsEl.innerHTML = `
    <h2>${s.code} – ${s.name}</h2>
    <p class="subtle">${s.department} • Status: <span class="badge ${status.cls}">${status.label}</span></p>

    <div class="row">
      <dl class="kv">
        <dt>Set-Code</dt><dd>${s.code}</dd>
        <dt>Fachbereich</dt><dd>${s.department}</dd>
      </dl>
      <dl class="kv">
        <dt>Packvorschrift</dt><dd>Version 1.0 (Demo)</dd>
        <dt>Instrumente</dt><dd>${lines.length} Positionen</dd>
      </dl>
    </div>

    <img class="thumb" src="${s.image_url}" alt="${s.code}" style="width:160px;height:100px;cursor:zoom-in;border-radius:8px;border:1px solid var(--chip-border)" data-zoom-src="${s.image_url}" data-caption="${s.code} – ${s.name}"/>

    <table class="table">
      <thead><tr><th></th><th>Instrument</th><th class="qty">Soll</th><th>Code</th><th>Kategorie</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="toolbar">
      <button id="startPack" class="primary">Packvorgang starten</button>
      ${cur ? '<button id="reportBtn" class="report-link">Packreport anzeigen</button>' : ''}
      ${cur && !cur.closed_at ? '<span class="badge warn">in Arbeit</span>' : ''}
    </div>
  `;

  // zoom on any element with data-zoom-src
  detailsEl.querySelectorAll("[data-zoom-src]").forEach(el => {
    el.addEventListener("click", () => {
      const src = el.getAttribute("data-zoom-src");
      const caption = el.getAttribute("data-caption") || "";
      openLightbox(src, caption);
    });
  });

  document.getElementById("startPack").onclick = () => openPackModal(s, lines);
  const rb = document.getElementById("reportBtn");
  if (rb) rb.onclick = () => openReport(selectedSetId);
}

// ----- Pack Modal logic -----
function openPackModal(setObj, lines) {
  const u = getUser();
  if (!u) { requireLogin(); return; }

  modalTitle.textContent = `Packvorgang – ${setObj.code} (User: ${u.username})`;
  modalBackdrop.classList.remove("hidden");

  const rows = lines.map((l, idx) => `
    <tr data-idx="${idx}">
      <td>
        <img class="ithumb" src="${l.instrument.image_url}" alt="${l.instrument.name}"
             title="Zum Vergrößern anklicken"
             data-zoom-src="${l.instrument.image_url}" data-caption="${l.instrument.name}" />
      </td>
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td class="qty">
        <div class="qtyctrl">
          <button type="button" class="minus">−</button>
          <input type="number" min="0" step="1" value="${l.qty_required}" class="qtyInput"/>
          <button type="button" class="plus">+</button>
        </div>
      </td>
      <td class="checkbox-center"><input class="missingCb" type="checkbox" /></td>
      <td>
        <select class="reasonSel">
          <option value="">— Grund wählen —</option>
          ${MISSING_REASONS.map(r => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </td>
      <td><textarea class="note" rows="1" placeholder="Notiz (optional)"></textarea></td>
    </tr>
  `).join("");

  modalBody.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th></th><th>Instrument</th><th class="qty">Soll</th><th class="qty">Ist</th>
          <th>Fehlteil?</th><th>Grund</th><th>Notiz</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Wire qty +/-, missing sync, and image zooms
  modalBody.querySelectorAll("tr").forEach(tr => {
    const idx = parseInt(tr.dataset.idx,10);
    const req = lines[idx].qty_required;
    const input = tr.querySelector(".qtyInput");
    const minus = tr.querySelector(".minus");
    const plus  = tr.querySelector(".plus");
    const cb = tr.querySelector(".missingCb");
    const reason = tr.querySelector(".reasonSel");

    function syncMissing() {
      const val = parseInt(input.value || "0", 10);
      const missing = val < req;
      cb.checked = missing;
      reason.disabled = !missing;
      if (!missing) { reason.value = ""; }
    }
    input.addEventListener("input", syncMissing);
    minus.addEventListener("click", () => { input.value = Math.max(0, (parseInt(input.value||"0",10)-1)); syncMissing(); });
    plus.addEventListener("click",  () => { input.value = (parseInt(input.value||"0",10)+1); syncMissing(); });
    cb.addEventListener("change", () => { reason.disabled = !cb.checked; if (!cb.checked) reason.value=""; });
    syncMissing();
  });

  // Image zoom
  modalBody.querySelectorAll("[data-zoom-src]").forEach(el => {
    el.addEventListener("click", () => {
      const src = el.getAttribute("data-zoom-src");
      const caption = el.getAttribute("data-caption") || "";
      openLightbox(src, caption);
    });
  });
}

function closeModal() { modalBackdrop.classList.add("hidden"); }

modalClose.onclick = closeModal;
cancelPack.onclick = closeModal;

savePack.onclick = () => {
  const u = getUser();
  if (!selectedSetId || !u) return;
  const lines = getSetLines(selectedSetId);
  const rows = Array.from(modalBody.querySelectorAll("tr"));
  const captured = rows.map((tr, idx) => {
    const req = lines[idx].qty_required;
    const qty_found = parseInt(tr.querySelector(".qtyInput").value || "0", 10);
    const missing = tr.querySelector(".missingCb").checked || qty_found < req;
    const reason = tr.querySelector(".reasonSel").value || null;
    const note = tr.querySelector(".note").value || null;
    return {
      instrument_id: lines[idx].instrument_id,
      instrument_name: lines[idx].instrument.name,
      qty_required: req,
      qty_found, missing, reason, note
    };
  });

  const hasMissing = captured.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
  const sessions = loadSessions();
  sessions[selectedSetId] = {
    set_id: selectedSetId,
    started_by: sessions[selectedSetId]?.started_by || u.username,
    started_at: sessions[selectedSetId]?.started_at || new Date().toISOString(),
    closed_by: u.username,
    closed_at: new Date().toISOString(),
    status: hasMissing ? "closed_with_missing" : "closed_ok",
    lines: captured
  };
  saveSessions(sessions);
  closeModal();
  renderSetList(searchEl.value);
  renderDetails();
  alert("Packvorgang gespeichert.");
};

// Report view (new window)
function openReport(setId) {
  const s = getSetById(setId);
  const sess = loadSessions()[setId];
  if (!sess) return;
  const html = `
    <html><head><meta charset="utf-8"><title>Packreport ${s.code}</title>
    <style>
      body{font:14px system-ui;padding:20px;color:#111}
      h1{font-size:18px;margin:0 0 8px}
      table{border-collapse:collapse;width:100%;margin-top:10px}
      th,td{border:1px solid #ccc;padding:6px;text-align:left}
      .muted{color:#555}
      img.thumb{width:160px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #ddd}
    </style></head><body>
      <h1>Packreport – ${s.code} – ${s.name}</h1>
      <div class="muted">Abgeschlossen: ${new Date(sess.closed_at).toLocaleString()}</div>
      <div class="muted">Benutzer: ${sess.closed_by || sess.started_by || "-"}</div>
      <img class="thumb" src="${s.image_url}" alt="${s.code}"/>

      <table>
        <thead><tr><th>Instrument</th><th>Soll</th><th>Ist</th><th>Fehlteil</th><th>Grund</th><th>Notiz</th></tr></thead>
        <tbody>
          ${sess.lines.map(l => `<tr>
            <td>${l.instrument_name}</td>
            <td>${l.qty_required}</td>
            <td>${l.qty_found}</td>
            <td>${l.missing ? "Ja" : "Nein"}</td>
            <td>${l.reason || ""}</td>
            <td>${l.note || ""}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <script>window.print()</script>
    </body></html>
  `;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// Search & reset
searchEl.addEventListener("input", () => renderSetList(searchEl.value));
resetBtn.addEventListener("click", () => {
  if (confirm("Lokale Testdaten (Packvorgänge) und Login-Status zurücksetzen?")) {
    resetSessions();
    logoutUser();
    selectedSetId = null;
    requireLogin();
  }
});

// Init
requireLogin();
