// admin.js
// Admin avec token GitHub : charge et met à jour data/apps.json dans le dépôt

const ADMIN_PASSWORD = "dok76B46"; // mot de passe admin

// Repo GitHub à mettre à jour
const GITHUB_OWNER = "EPS-BARLETTA";
const GITHUB_REPO = "EPS-BARLETTA-mes-outils";
const GITHUB_BRANCH = "main";
const GITHUB_FILE_PATH = "data/apps.json";

let githubToken = "";
let githubFileSha = ""; // sha du fichier apps.json dans GitHub

const loginOverlay = document.getElementById("loginOverlay");
const adminMain = document.getElementById("adminMain");
const adminPasswordInput = document.getElementById("adminPassword");
const githubTokenInput = document.getElementById("githubTokenInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const appForm = document.getElementById("appForm");
const appsAdminList = document.getElementById("appsAdminList");
const exportBtn = document.getElementById("exportBtn");
const syncBtn = document.getElementById("syncBtn");

let apps = [];

// --- Connexion admin + récupération token ---
function doLogin() {
  const pwd = adminPasswordInput.value.trim();
  const token = githubTokenInput.value.trim();

  if (pwd !== ADMIN_PASSWORD || !token) {
    loginError.style.display = "block";
    return;
  }

  githubToken = token;
  loginError.style.display = "none";

  // On masque l'overlay et on affiche l'admin
  loginOverlay.style.display = "none";
  adminMain.style.display = "block";

  // Charger les apps directement depuis GitHub
  loadAppsFromGitHub();
}

loginBtn.addEventListener("click", doLogin);
adminPasswordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    doLogin();
  }
});
githubTokenInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    doLogin();
  }
});

// --- Utilitaires encodage base64 (UTF-8 safe) ---
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}

// --- Charger apps.json depuis GitHub ---
async function loadAppsFromGitHub() {
  appsAdminList.innerHTML = `<p class="empty-state">Chargement des applications depuis GitHub...</p>`;

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`
      }
    });

    if (res.status === 404) {
      // Fichier absent : on part d'une liste vide
      apps = [];
      githubFileSha = "";
      renderAdminList();
      alert("apps.json n'existe pas encore dans le dépôt. Il sera créé à la première sauvegarde.");
      return;
    }

    if (!res.ok) {
      throw new Error("Erreur HTTP " + res.status);
    }

    const data = await res.json();
    githubFileSha = data.sha;

    const decoded = fromBase64(data.content.replace(/\n/g, ""));
    apps = JSON.parse(decoded);

    renderAdminList();
  } catch (err) {
    console.error("Erreur lors du chargement depuis GitHub :", err);
    appsAdminList.innerHTML = `<p class="error">Impossible de charger apps.json depuis GitHub. Vérifie ton token et les droits sur le dépôt.</p>`;
  }
}

// --- Afficher la liste des apps ---
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

// --- Sauvegarder apps.json dans GitHub ---
async function saveAppsToGitHub(showAlert = true) {
  if (!githubToken) {
    alert("Token GitHub manquant. Recharge la page et reconnecte-toi.");
    return;
  }

  const json = JSON.stringify(apps, null, 2);
  const contentBase64 = toBase64(json);

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

  const body = {
    message: "Mise à jour apps.json depuis l'admin web",
    content: contentBase64,
    branch: GITHUB_BRANCH
  };

  if (githubFileSha) {
    body.sha = githubFileSha;
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Réponse GitHub non OK :", res.status, txt);
      alert("Erreur lors de la sauvegarde sur GitHub.\nCode: " + res.status + "\nDétails: " + txt);
      return;
    }

    const data = await res.json();
    githubFileSha = data.content.sha;

    if (showAlert) {
      alert("✅ Sauvegarde effectuée sur GitHub !\nLa page publique est à jour.");
    }
  } catch (err) {
    console.error("Erreur lors de la sauvegarde sur GitHub :", err);
    alert("Erreur réseau lors de la sauvegarde sur GitHub.");
  }
}

// --- Ajouter une app ---
appForm.addEventListener("submit", async e => {
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

  // Sauvegarde automatique sur GitHub
  await saveAppsToGitHub(false);
  alert("✅ Application ajoutée et publiée sur GitHub.");
});

// --- Supprimer une app ---
window.deleteApp = async function (id) {
  if (!confirm("Supprimer cette application ?")) return;
  apps = apps.filter(app => app.id !== id);
  renderAdminList();
  await saveAppsToGitHub(false);
  alert("✅ Application supprimée et mise à jour sur GitHub.");
};

// --- Télécharger apps.json (backup local) ---
exportBtn.addEventListener("click", () => {
  const json = JSON.stringify(apps, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "apps.json";
  a.click();

  URL.revokeObjectURL(url);
});

// --- Bouton de sauvegarde manuelle GitHub ---
syncBtn.addEventListener("click", () => {
  saveAppsToGitHub(true);
});
