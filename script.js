/* ---------------------------------------------------------
   Chargement des applications (apps.json) avec anti-cache
--------------------------------------------------------- */

let apps = [];

function loadApps(callback) {
  fetch("data/apps.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      apps = data;
      if (callback) callback();
    })
    .catch(err => {
      console.error("Erreur chargement apps.json :", err);
    });
}


/* ---------------------------------------------------------
   Affichage d'une liste d'apps dans un conteneur
--------------------------------------------------------- */

function renderApps(list, targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<p class="empty-state">Aucune application disponible.</p>`;
    return;
  }

  container.innerHTML = list
    .map(app => {
      return `
        <article class="app-card enhanced-card">

          <div class="app-card-icon enhanced-icon">${app.icon || "📚"}</div>

          <div class="app-card-body">

            <h2 class="app-name">${app.name}</h2>

            <p class="app-description">
              ${app.description || ""}
            </p>

            <a href="${app.url}" target="_blank" class="btn-primary enhanced-button">
              Ouvrir
            </a>

          </div>

        </article>
      `;
    })
    .join("");
}


/* ---------------------------------------------------------
   Charger seulement les apps d'une compétence EPS (CA1-CA5)
--------------------------------------------------------- */

function loadAppsForCategory(category, targetId) {
  loadApps(() => {
    const filtered = apps.filter(a => (a.category || "").toUpperCase() === category.toUpperCase());
    renderApps(filtered, targetId);
  });
}


/* ---------------------------------------------------------
   Charger les apps hors EPS → Autres matières
--------------------------------------------------------- */

function loadAppsAutres(targetId) {
  loadApps(() => {
    const filtered = apps.filter(a => {
      const cat = (a.category || "").toUpperCase();
      return !["CA1", "CA2", "CA3", "CA4", "CA5"].includes(cat);
    });

    renderApps(filtered, targetId);
  });
}


/* ---------------------------------------------------------
   Mode clair / sombre (compatible toutes pages)
--------------------------------------------------------- */

(function applyTheme() {
  const stored = localStorage.getItem("eps-theme");
  if (stored === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
  }
})();
