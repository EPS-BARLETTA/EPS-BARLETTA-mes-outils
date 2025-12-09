/* ---------------------------------------------------------
   CONFIGURATION
--------------------------------------------------------- */

// Mot de passe admin
const ADMIN_PASSWORD = "dok76B46";   // 🔒 Ton mot de passe
let githubToken = "";                // Stocke le token GitHub entré au login

// Repo GitHub pour push apps.json
const GITHUB_USER = "EPS-BARLETTA";
const GITHUB_REPO = "EPS-BARLETTA-mes-outils";
const JSON_PATH = "data/apps.json";

let apps = []; // Liste locale des apps


/* ---------------------------------------------------------
   ÉLÉMENTS DOM
--------------------------------------------------------- */

const loginOverlay = document.getElementById("loginOverlay");
const adminMain = document.getElementById("adminMain");

const adminPasswordInput = document.getElementById("adminPassword");
const githubTokenInput = document.getElementById("githubTokenInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const appForm = document.getElementById("appForm");
const appsAdminList = document.getElementById("appsAdminList");

const appName = document.getElementById("appName");
const appIcon = document.getElementById("appIcon");
const appUrl = document.getElementById("appUrl");
const appCA = document.getElementById("appCA");
const appMatiere = document.getElementById("appMatiere");


/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */

loginBtn.addEventListener("click", () => {
  const pass = adminPasswordInput.value.trim();
  githubToken = githubTokenInput.value.trim();

  if (pass === ADMIN_PASSWORD && githubToken !== "") {
    loginOverlay.style.display = "none";
    adminMain.style.display = "block";
    loadAppsFromGitHub();
  } else {
    loginError.style.display = "block";
  }
});


/* ---------------------------------------------------------
   CHARGEMENT apps.json DEPUIS GITHUB
--------------------------------------------------------- */

function loadAppsFromGitHub() {
  fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${JSON_PATH}?v=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      apps = data;
      renderAdminList();
    })
    .catch(err => {
      console.error("Erreur lors du chargement apps.json :", err);
      appsAdminList.innerHTML = `<p class="error">Impossible de charger apps.json</p>`;
    });
}


/* ---------------------------------------------------------
   AFFICHAGE DES APPS DANS L'ADMIN
--------------------------------------------------------- */

function renderAdminList() {
  if (!apps.length) {
    appsAdminList.innerHTML = `<p>Aucune application pour le moment.</p>`;
    return;
  }

  appsAdminList.innerHTML = apps
    .map((app, index) => {
      return `
        <div class="app-card admin-app-card">
          <div class="app-card-icon">${app.icon || "📚"}</div>
          <div class="app-card-body">
            <h2>${app.name}</h2>
            <p><strong>URL :</strong> ${app.url}</p>
            <p><strong>CA :</strong> ${app.category || "Aucune"}</p>
            <p><strong>Matière :</strong> ${app.matiere || "Aucune"}</p>

            <button class="btn-outline" onclick="editApp(${index})">Modifier</button>
            <button class="btn-primary" style="background:#b91c1c" onclick="deleteApp(${index})">Supprimer</button>
          </div>
        </div>
      `;
    })
    .join("");
}


/* ---------------------------------------------------------
   AJOUT / MODIFICATION D'UNE APP
--------------------------------------------------------- */

let editIndex = null;

appForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newApp = {
    name: appName.value.trim(),
    icon: appIcon.value.trim(),
    url: appUrl.value.trim(),
    category: appCA.value.trim(),     // CA1–CA5 ou ""
    matiere: appMatiere.value.trim(), // Matière ou ""
  };

  if (editIndex === null) {
    apps.push(newApp);
  } else {
    apps[editIndex] = newApp;
    editIndex = null;
  }

  saveToGitHub();
});


/* ---------------------------------------------------------
   SUPPRESSION D’UNE APP
--------------------------------------------------------- */

function deleteApp(index) {
  if (!confirm("Supprimer cette application ?")) return;
  apps.splice(index, 1);
  saveToGitHub();
}


/* ---------------------------------------------------------
   ÉDITION D’UNE APP (remplit le formulaire)
--------------------------------------------------------- */

function editApp(index) {
  const app = apps[index];
  editIndex = index;

  appName.value = app.name;
  appIcon.value = app.icon;
  appUrl.value = app.url;
  appCA.value = app.category || "";
  appMatiere.value = app.matiere || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------------------------------------------------------
   ENREGISTRER apps.json SUR GITHUB VIA API
--------------------------------------------------------- */

async function saveToGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_PATH}`;

  // Récupérer le SHA du fichier
  const fileInfo = await fetch(url).then(r => r.json());
  const sha = fileInfo.sha;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(apps, null, 2))));

  const body = {
    message: "Mise à jour apps.json via admin",
    content: content,
    sha: sha
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("Mise à jour réussie !");
    loadAppsFromGitHub();
  } else {
    alert("Erreur lors de l'enregistrement sur GitHub.");
  }
}
