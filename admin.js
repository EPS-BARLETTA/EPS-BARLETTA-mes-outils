// admin.js
// Espace administrateur : login + gestion apps + export JSON

const ADMIN_PASSWORD = "ton-mot-de-passe-ici"; // 🔒 À CHANGER !

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
