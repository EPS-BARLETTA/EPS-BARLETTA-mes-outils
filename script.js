// script.js
// Charge apps.json et construit la grille d'applications + filtres

let apps = [];
let filteredApps = [];

const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

// Charger les données
fetch("data/apps.json")
  .then(res => res.json())
  .then(data => {
    apps = data;
    filteredApps = [...apps];
    initCategoryFilter();
    renderApps();
  })
  .catch(err => {
    console.error("Erreur de chargement des apps.json :", err);
    appsGrid.innerHTML = `<p class="error">Impossible de charger la liste des applications.</p>`;
  });

// Remplir la liste des matières / catégories
function initCategoryFilter() {
  const categories = Array.from(
    new Set(
      apps
        .map(a => a.category)
        .filter(Boolean)
    )
  ).sort();

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

// Afficher les apps
function renderApps() {
  if (!filteredApps.length) {
    appsGrid.innerHTML = `<p class="empty-state">Aucune application ne correspond à la recherche.</p>`;
    return;
  }

  appsGrid.innerHTML = filteredApps
    .map(app => {
      return `
        <article class="app-card">
          <div class="app-card-icon">${app.icon || "📚"}</div>
          <div class="app-card-body">
            <div class="app-card-header">
              <h2>${app.name}</h2>
              ${app.category ? `<span class="badge">${app.category}</span>` : ""}
            </div>
            <p class="app-card-desc">${app.description || ""}</p>
            <a href="${app.url}" target="_blank" class="btn-primary">Ouvrir l'application</a>
          </div>
        </article>
      `;
    })
    .join("");
}

// Logique de filtrage
function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  filteredApps = apps.filter(app => {
    const text = `
      ${app.name || ""}
      ${app.description || ""}
      ${app.category || ""}
    `.toLowerCase();

    const matchText = q === "" || text.includes(q);
    const matchCat = !cat || app.category === cat;

    return matchText && matchCat;
  });

  renderApps();
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
