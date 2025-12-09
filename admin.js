/* ---------------------------------------------------------
   CONFIGURATION
--------------------------------------------------------- */

const ADMIN_PASSWORD = "dok76B46";
let githubToken = "";

const GITHUB_USER = "EPS-BARLETTA";
const GITHUB_REPO = "EPS-BARLETTA-mes-outils";
const JSON_PATH = "data/apps.json";

let apps = [];


/* ---------------------------------------------------------
   ELEMENTS DOM
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
const appDescription = document.getElementById("appDescription");
const appCA = document.getElementById("appCA");
const appMatiere = document.getElementById("appMatiere");

let editIndex = null;


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
   CHARGER apps.json
--------------------------------------------------------- */

function loadAppsFromGitHub() {
  fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${JSON_PATH}?v=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      apps = data;
      renderAdminList();
    });
}


/* ---------------------------------------------------------
   AFFICHAGE LISTE
--------------------------------------------------------- */

function renderAdminList() {
  if (!apps.length) {
    appsAdminList.innerHTML = "<p>Aucune app enregistrée.</p>";
    return;
  }

  appsAdminList.innerHTML = apps.map((app, index) => `
    <div class="app-card admin-app-card">

      <div class="app-card-icon">${app.icon || "📚"}</div>

      <div class="app-card-body">
        <h2>${app.name}</h2>

        <p><strong>Description :</strong> ${app.description || "Aucune"}</p>
        <p><strong>URL :</strong> ${app.url}</p>
        <p><strong>Catégorie :</strong> ${app.category || "Aucune"}</p>
        <p><strong>Matière :</strong> ${app.matiere || "Aucune"}</p>

        <button class="btn-outline" onclick="editApp(${index})">Modifier</button>
        <button class="btn-primary" style="background:#b91c1c" onclick="deleteApp(${index})">Supprimer</button>
      </div>

    </div>
  `).join("");
}


/* ---------------------------------------------------------
   AJOUT / MODIFICATION
--------------------------------------------------------- */

appForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newApp = {
    name: appName.value.trim(),
    icon: appIcon.value.trim(),
    url: appUrl.value.trim(),
    description: appDescription.value.trim(),
    category: appCA.value.trim(),   // CA1–CA5 ou EPS-OUTILS ou ""
    matiere: appMatiere.value.trim()
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
   MODIFIER
--------------------------------------------------------- */

function editApp(index) {
  const a = apps[index];
  editIndex = index;

  appName.value = a.name;
  appIcon.value = a.icon;
  appUrl.value = a.url;
  appDescription.value = a.description || "";
  appCA.value = a.category || "";
  appMatiere.value = a.matiere || "";
}


/* ---------------------------------------------------------
   SUPPRIMER
--------------------------------------------------------- */

function deleteApp(index) {
  if (!confirm("Supprimer cette application ?")) return;
  apps.splice(index, 1);
  saveToGitHub();
}


/* ---------------------------------------------------------
   SAUVEGARDE SUR GITHUB
--------------------------------------------------------- */

async function saveToGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_PATH}`;

  const fileInfo = await fetch(url).then(r => r.json());
  const sha = fileInfo.sha;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(apps, null, 2))));

  const body = {
    message: "Mise à jour apps.json via Admin",
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
    alert("Modification enregistrée !");
    loadAppsFromGitHub();
  } else {
    alert("Erreur lors de la sauvegarde.");
  }
}
