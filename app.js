// ─── Hjälpfunktioner ───────────────────────────────────────────────────────

const STORAGE_KEY = "techbladet_articles";

function loadArticles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast-msg ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

function truncate(text, maxLen = 60) {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── Rendera artiklar ──────────────────────────────────────────────────────

function renderArticles() {
  const articles = loadArticles();
  const container = document.getElementById("dynamic-articles");
  container.innerHTML = "";

  if (articles.length === 0) {
    container.innerHTML = `<p class="text-muted small">Inga skapade artiklar ännu.</p>`;
    return;
  }

  articles.forEach((article, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "article-wrapper mb-4";
    wrapper.style.cssText = "width: 100%; display: block;";

    const categoryColors = {
      AI: "danger", Hårdvara: "primary", Mjukvara: "info",
      Säkerhet: "warning", Startups: "dark", Hållbarhet: "success"
    };
    const badgeColor = categoryColors[article.category] || "secondary";
    const textClass = article.category === "Säkerhet" ? "text-dark" : "";

    const imageHtml = article.imageUrl
      ? `<img src="${escapeHtml(article.imageUrl)}" class="card-img-top" alt="${escapeHtml(article.title)}" style="height:220px;object-fit:cover;">`
      : "";

    wrapper.innerHTML = `
      <button class="btn btn-sm btn-danger article-delete-btn" data-index="${index}" title="Radera artikel">
        <i class="bi bi-trash"></i>
      </button>
      <a href="#" class="card-link">
        <article class="card" style="width:100%;">
          ${imageHtml}
          <div class="card-body">
            <span class="badge bg-${badgeColor} ${textClass} mb-2">${escapeHtml(article.category)}</span>
            <h3 class="card-title h5">${escapeHtml(article.title)}</h3>
            <p class="card-text">${escapeHtml(truncate(article.content))}</p>
            <p class="text-muted small mb-0">${formatDate(article.date)}</p>
          </div>
        </article>
      </a>
    `;

    container.appendChild(wrapper);
  });

  container.querySelectorAll(".article-delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = parseInt(btn.dataset.index);
      deleteArticle(i);
    });
  });
}

// ─── Skapa artikel ─────────────────────────────────────────────────────────

function createArticle(title, content, category, imageUrl) {
  const articles = loadArticles();
  articles.unshift({
    id: Date.now(),
    title,
    content,
    category,
    imageUrl,
    date: new Date().toISOString()
  });
  saveArticles(articles);
  renderArticles();
  showToast("✅ Artikeln skapades!", "success");
}

// ─── Radera artikel ────────────────────────────────────────────────────────

function deleteArticle(index) {
  const articles = loadArticles();
  articles.splice(index, 1);
  saveArticles(articles);
  renderArticles();
  showToast("🗑️ Artikeln raderades.", "danger");
}

// ─── XSS-skydd ────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  // Toast-container
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);

  // Hitta artikelkolumnen
  const articleCol = document.querySelector(".col-md-8");

  // Knapp för att visa/dölja formulär
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn btn-sm mb-3";
  toggleBtn.style.cssText = "background:#2d3f55;color:#fff;";
  toggleBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Ny artikel`;
  articleCol.insertBefore(toggleBtn, articleCol.firstChild);

  // Formulär-sektion
  const formSection = document.createElement("div");
  formSection.id = "article-form-section";
  formSection.style.display = "none";
  formSection.innerHTML = `
    <h5 class="mb-3">Skapa ny artikel</h5>
    <div class="mb-3">
      <label class="form-label fw-bold">Titel *</label>
      <input type="text" id="art-title" class="form-control" placeholder="Artikelns rubrik">
    </div>
    <div class="mb-3">
      <label class="form-label fw-bold">Innehåll *</label>
      <textarea id="art-content" class="form-control" rows="3" placeholder="Skriv artikelns innehåll…"></textarea>
    </div>
    <div class="mb-3">
      <label class="form-label fw-bold">Kategori</label>
      <select id="art-category" class="form-select">
        <option>AI</option>
        <option>Hårdvara</option>
        <option>Mjukvara</option>
        <option>Säkerhet</option>
        <option>Startups</option>
        <option>Hållbarhet</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label fw-bold">Bild-URL <span class="text-muted fw-normal">(valfritt)</span></label>
      <input type="url" id="art-image" class="form-control" placeholder="https://...">
    </div>
    <div class="d-flex gap-2">
      <button id="art-submit" class="btn btn-sm" style="background:#2d3f55;color:#fff;">Publicera</button>
      <button id="art-cancel" class="btn btn-sm btn-outline-secondary">Avbryt</button>
    </div>
  `;
  articleCol.insertBefore(formSection, toggleBtn.nextSibling);

  // Dynamisk artikel-container
  const dynamicContainer = document.createElement("div");
  dynamicContainer.id = "dynamic-articles";
  dynamicContainer.style.width = "100%";
  articleCol.insertBefore(dynamicContainer, formSection.nextSibling);

  // ── Event listeners ──

  toggleBtn.addEventListener("click", () => {
    const open = formSection.style.display !== "none";
    formSection.style.display = open ? "none" : "block";
    toggleBtn.innerHTML = open
      ? `<i class="bi bi-plus-lg me-1"></i> Ny artikel`
      : `<i class="bi bi-x-lg me-1"></i> Stäng`;
  });

  document.getElementById("art-cancel").addEventListener("click", () => {
    formSection.style.display = "none";
    toggleBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Ny artikel`;
  });

  document.getElementById("art-submit").addEventListener("click", () => {
    const title    = document.getElementById("art-title").value.trim();
    const content  = document.getElementById("art-content").value.trim();
    const category = document.getElementById("art-category").value;
    const imageUrl = document.getElementById("art-image").value.trim();

    if (!title || !content) {
      showToast("⚠️ Titel och innehåll krävs.", "danger");
      return;
    }

    createArticle(title, content, category, imageUrl);

    document.getElementById("art-title").value  = "";
    document.getElementById("art-content").value = "";
    document.getElementById("art-image").value   = "";
    formSection.style.display = "none";
    toggleBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Ny artikel`;
  });

  renderArticles();
});