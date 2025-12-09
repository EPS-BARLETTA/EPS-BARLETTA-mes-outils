/* ---------------------------------------------------------
   SCRIPT GLOBAL POUR TOUTES LES PAGES
   - Chargement apps.json (avec anti-cache)
   - Dispatch CA1 → CA5
   - Gestion Autres matières
   - Injection dans les pages
--------------------------------------------------------- */

let apps = [];

// Charger apps.json avec anti-cache
function loadApps(callback) {
  fetch("data/apps.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      apps = data;
      if (callback) callback();
    })
    .catch(err => {
      console.error("Erreur de chargement apps.json :", err);
    });
}

/* ---------------------------------------------------------
   Fonction d'affichage d'une liste d'apps dans une page
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
            <h2 style="margin:0;font-size:1.1rem;">${app.name}</h2>
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
   Charger les apps d'une CA : CA1, CA2, CA3, CA4, CA5
--------------------------------------------------------- */
function loadAppsForCategory(category, targetId) {
  loadApps(() => {
    const filtered = apps.filter(a => (a.category || "").toUpperCase() === category.toUpperCase());
    renderApps(filtered, targetId);
  });
}

/* ---------------------------------------------------------
   Charger les apps pour la page AUTRES MATIÈRES
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
   Mode clair / sombre (utilisé sur toutes les pages)
--------------------------------------------------------- */
(function applyThemeIfNeeded() {
  const stored = localStorage.getItem("eps-theme");
  if (stored === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
  }
})();
