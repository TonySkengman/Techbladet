document.addEventListener("DOMContentLoaded", () => {
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("article-content");

  if (!id) {
    container.innerHTML = `<p class="text-danger">Ingen artikel angiven.</p>`;
    return;
  }

  const categoryColors = {
    AI: "danger", Hårdvara: "primary", Mjukvara: "info",
    Säkerhet: "warning", Startups: "dark", Hållbarhet: "success"
  };

  // Hämta artikel — antingen statisk eller dynamisk
  const article = id.startsWith("static_")
    ? getStaticArticle(id)
    : loadArticles().find(a => String(a.id) === id);

  if (!article) {
    container.innerHTML = `<p class="text-danger">Artikeln hittades inte.</p>`;
    return;
  }

  const badgeColor = categoryColors[article.category] || "secondary";
  const textClass  = article.category === "Säkerhet" ? "text-dark" : "";
  const imageHtml  = article.imageUrl
    ? `<img src="${escapeHtml(article.imageUrl)}" class="card-img-top" alt="${escapeHtml(article.title)}">`
    : "";
  const metaLine   = article.author
    ? `${article.author} · ${formatDate(article.date)}`
    : formatDate(article.date);

  document.title = `${article.title} – Techbladet`;

  container.innerHTML = `
    <a href="index.html" class="btn btn-sm btn-outline-secondary mb-3 d-inline-block">
      <i class="bi bi-arrow-left me-1"></i> Tillbaka
    </a>
    <div class="card">
      ${imageHtml}
      <div class="card-body">
        <span class="badge bg-${badgeColor} ${textClass} mb-2">${escapeHtml(article.category)}</span>
        <h1 class="card-title h2 mb-2">${escapeHtml(article.title)}</h1>
        <p class="text-muted small mb-4">${metaLine}</p>
        <div class="article-body" style="line-height:1.8; font-size:1.05rem;">
          ${escapeHtml(article.content)}
        </div>
      </div>
      <div class="card-body border-top pt-3" id="engagement-placeholder"></div>
    </div>
  `;

  document.getElementById("engagement-placeholder").appendChild(createEngagementSection(id));
});