/* =========================================================
   CONFIGURATION
   ========================================================= */

const OWNER = "EPS-BARLETTA";
const REPO = "EPS-BARLETTA-mes-outils";
const FILE_PATH = "data/apps.json";
const BRANCH = "main";

/* =========================================================
   ELEMENTS DOM
   ========================================================= */

const loginOverlay = document.getElementById("loginOverlay");
const adminMain = document.getElementById("adminMain");

const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const adminPasswordInput = document.getElementById("adminPassword");

const tokenInput = document.getElementById("githubToken");

const appForm = document.getElementById("appForm");
const appsAdminList = document.getElementById("appsAdminList");

/* =========================================================
   VARIABLES
   ========================================================= */

let apps = [];
let fileSha = null;

/* =========================================================
   AUTHENTIFICATION ADMIN
   ========================================================= */

loginBtn.onclick = doLogin;
adminPasswordInput.onkeydown = (e) => {
  if (e.key === "Enter") doLogin();
};

function doLogin() {
  // 🔐 CHANGE ICI TON MOT DE PASSE
  const ADMIN_PASSWORD = "dok76B46";

  if (adminPasswordInput.value === ADMIN_PASSWORD) {
    loginOverlay.style.display = "none";
    adminMain.style.display = "block";
  } else {
    loginError.style.display = "block";
  }
}

/* =========================================================
   CHARGER APPS.JSON DEPUIS GITHUB
   ========================================================= */

async function loadApps() {
  const token = tokenInput.value;

  if (!token) {
    alert("⚠️ Collez votre token GitHub dans le champ prévu avant d'utiliser l'admin.");
    return;
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();

  fileSha = data.sha; // contient la signature du fichier
  apps = JSON.parse(atob(data.content)); // décode le JSON base64

  renderAppsList();
}

/* =========================================================
   SAUVEGARDE AUTOMATIQUE VERS GITHUB
   ========================================================= */

async function saveApps() {
  const token = tokenInput.value;

  if (!token) {
    alert("⚠️ Token GitHub manquant !");
    return;
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  const newContent = btoa(JSON.stringify(apps, null, 2));

  const body = {
    message: "Mise à jour apps.json via admin",
    content: newContent,
    sha: fileSha,
    branch: BRANCH
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    alert("❌ Erreur lors de la sauvegarde !");
    console.error(await res.text());
    return;
  }

  const json = await res.json();
  fileSha = json.content.sha;

  alert("✅ apps.json mis à jour sur GitHub !");
}

/* =========================================================
   AFFICHAGE LISTE APPS
   ========================================================= */

function renderAppsList() {
  appsAdminList.innerHTML = "";

  apps.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";

    card.innerHTML = `
      <div class="app-card-icon">${app.icon || "📚"}</div>
      <div class="app-card-body">
        <h3>${app.name}</h3>
        <p>${app.description || ""}</p>
        <code>${app.url}</code>
      </div>
      <button class="btn-danger" onclick="deleteApp(${app.id})">Supprimer</button>
    `;

    appsAdminList.appendChild(card);
  });
}

/* =========================================================
   AJOUT D'UNE APPLICATION
   ========================================================= */

appForm.onsubmit = (e) => {
  e.preventDefault();

  const name = document.getElementById("appName").value;
  const category = document.getElementById("appCategory").value;
  const url = document.getElementById("appUrl").value;
  const icon = document.getElementById("appIcon").value;
  const description = document.getElementById("appDescription").value;

  const id = apps.length ? Math.max(...apps.map(a => a.id)) + 1 : 1;

  apps.push({ id, name, category, url, icon, description });

  renderAppsList();
  saveApps();
};

/* =========================================================
   SUPPRESSION D'UNE APPLICATION
   ========================================================= */

function deleteApp(id) {
  if (!confirm("Supprimer cette app ?")) return;

  apps = apps.filter(a => a.id !== id);

  renderAppsList();
  saveApps();
}

/* =========================================================
   CHARGE LA LISTE DÈS QUE LE TOKEN EST COLLÉ
   ========================================================= */

tokenInput.onchange = loadApps;
tokenInput.onkeyup = loadApps;
