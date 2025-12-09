// admin.js
// Espace administrateur : login + gestion apps + export JSON

const ADMIN_PASSWORD = "dok76B46"; // 🔒 Mot de passe admin défini

const loginOverlay = document.getElementById("loginOverlay");
const adminMain = document.getElementById("adminMain");
const adminPasswordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const appForm = document.getElementById("appForm");
const appsAdminList = document.getElementById("appsAdminList");
const exportBtn = document.getElementById("exportBtn");

let apps = [];

// --- Login admin ---
function doLogin() {
  const value = adminPasswordInput.value.trim();
  if (value === ADMIN_PASSWORD) {
    loginOverlay.style.display = "none";
    adminMain.style.display = "block";
  } else {
    loginError.style.display = "block";
  }
}

loginBtn.addEventListener("click", doLogin);
adminPasswordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    doLogin();
  }
});

// --- Charger les apps ---
fetch("data/apps.json")
  .then(res => res.json())
  .then(data => {
    apps = data;
    renderAdminList();
  })
  .catch(err => {
    console.error("Erreur de chargement apps.json", err);
    appsAdminList.innerHTML = `<p class="error">Impossible de charger data/apps.json</p>`;
  });

// --- Affichage liste admin ---
function renderAdminList() {
  if (!apps.length) {
    appsAdminList.innerHTML = `<p class="empty-state">Aucune application pour le moment.</p>`;
    return;
  }

  appsAdminList.innerHTML = apps
    .map(app => {
      return `
        <div class="app-card" style="padding:10px 12px;">
          <div class="app-card-icon" style="min-width:44px;height:44px;border-radius:14px;font-size:1.3rem;">
            ${app.icon || "📚"}
          </div>
          <div class="app-card-body" style="gap:4px;">
            <div class="app-card-header">
              <h2 style="font-size:0.95rem;">${app.name}</h2>
              ${app.category ? `<span class="badge">${app.category}</span>` : ""}
            </div>
            <p class="app-card-desc" style="font-size:0.8rem;">${app.description || ""}</p>
            <p style="margin:0;font-size:0.78rem;color:#6b7280;word-break:break-all;">
              <code>${app.url}</code>
            </p>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-self:center;">
            <button class="btn-danger" onclick="deleteApp(${app.id})">Supprimer</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// --- Ajouter une app ---
appForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("appName").value.trim();
  const category = document.getElementById("appCategory").value.trim();
  const url = document.getElementById("appUrl").value.trim();
  const icon = document.getElementById("appIcon").value.trim() || "📚";
  const description = document.getElementById("appDescription").value.trim();

  if (!name || !url) {
    alert("Nom et URL obligatoires.");
    return;
  }

  const maxId = apps.reduce((m, a) => Math.max(m, a.id || 0), 0);
  apps.push({
    id: maxId + 1,
    name,
    category,
    url,
    icon,
    description
  });

  appForm.reset();
  renderAdminList();
});

// --- Supprimer une app ---
function deleteApp(id) {
  if (!confirm("Supprimer cette application ?")) return;
  apps = apps.filter(a => a.id !== id);
  renderAdminList();
}

// --- Exporter JSON ---
exportBtn.addEventListener("click", () => {
  const json = JSON.stringify(apps, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "apps.json";
  a.click();

  URL.revokeObjectURL(url);

  alert("apps.json téléchargé !");
});
