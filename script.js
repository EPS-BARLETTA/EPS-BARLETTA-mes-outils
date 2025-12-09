// script.js
// Charge apps.json (avec anti-cache) et construit la grille d'applications + filtres

let apps = [];
let filteredApps = [];

const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");

// Charger les données avec anti-cache
fetch("data/apps.json?v=" + Date.now())
  .then(res => res.json())
  .then(data => {
    // on enrichit les apps avec un "type" dérivé
    apps = data.map(app => {
      const cat = (app.category || "").toLowerCase();
      const type = cat.includes("eps") ? "eps" : "autres";
      return { ...app, _type: type };
    });

    filteredApps = [...apps];
    renderApps();
  })
  .catch(err => {
    console.error("Erreur de chargement des apps.json :", err);
    appsGrid.innerHTML = `<p class="error">Impossible de charger la liste des applications.</p>`;
  });

// Afficher les apps
function renderApps() {
  if (!filteredApps.length) {
    appsGrid.innerHTML = `<p class="empty-state">Aucune application ne correspond à la recherche.</p>`;
    return;
  }

  appsGrid.innerHTML = filteredApps
    .map(app => {
      const typeLabel = app._type === "eps" ? "EPS" : "Autres matières";

      return `
        <article class="app-card enhanced-card">
          <div class="app-card-icon enhanced-icon">${app.icon || "📚"}</div>
          <div class="app-card-body">
            <div class="app-card-header">
              <h2>${app.name}</h2>
              <div style="display:flex;gap:6px;align-items:center;">
                <span class="badge enhanced-badge">${typeLabel}</span>
                ${
                  app.category && !app.category.toLowerCase().includes("eps")
                    ? `<span class="category-pill">${app.category}</span>`
                    : ""
                }
              </div>
            </div>
            <p class="app-card-desc">${app.description || ""}</p>
            <a href="${app.url}" target="_blank" class="btn-primary enhanced-button">
              🚀 Ouvrir l'application
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

// Filtrer les apps
function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const type = typeFilter?.value || "";

  filteredApps = apps.filter(app => {
    const text = `${app.name || ""} ${app.description || ""} ${app.category || ""}`.toLowerCase();

    const matchText = q === "" || text.includes(q);
    const matchType = !type || app._type === type;

    return matchText && matchType;
  });

  renderApps();
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}
if (typeFilter) {
  typeFilter.addEventListener("change", applyFilters);
}
