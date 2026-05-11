const STATIC_ARTICLES = [
  {
    id: "static_1",
    title: "OpenAI:s AGI-system klarar läkarexamen med högsta betyg — och föreslår ny cancerbehandling",
    category: "AI",
    date: new Date().toISOString(),
    author: "Sara Ekström",
    imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    content: `OpenAI meddelade i morse att deras nya system, kallat O3-Pro, självständigt har identifierat en potentiell behandlingsmetod för en sällsynt form av bukspottkörtelcancer. Resultaten skickas nu till kliniska prövningar i Sverige och USA. Etikforskare varnar samtidigt för att vi rör oss in i okänt territorium.`
  },
  {
    id: "static_2",
    title: "Apple lanserar AR-glasögon till konsumentpris — leverans i höst",
    category: "Hårdvara",
    date: new Date().toISOString(),
    author: "Redaktionen",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    content: `Efter år av rykten är Apples andra generation av mixed reality-glasögon bekräftad. Priset sätts till 9 999 kr och de väger under 60 gram.`
  },
  {
    id: "static_3",
    title: "AI-genererade deepfakes lurar BankID — svenska banker i kris",
    category: "Säkerhet",
    date: new Date().toISOString(),
    author: "Redaktionen",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    content: `En ny typ av realtids-deepfake har använts för att kringgå BankID:s ansiktsigenkänning. Flera storbanker pausar tillfälligt tjänsten.`
  }
];

function getStaticArticle(id) {
  return STATIC_ARTICLES.find(a => a.id === id) || null;
}




// ─── Hjälpfunktioner ───────────────────────────────────────────────────────

const STORAGE_KEY    = "techbladet_articles";
const REACTIONS_KEY  = "techbladet_reactions";
const COMMENTS_KEY   = "techbladet_comments";

function loadArticles()          { return JSON.parse(localStorage.getItem(STORAGE_KEY)   || "[]"); }
function saveArticles(a)         { localStorage.setItem(STORAGE_KEY,   JSON.stringify(a)); }
function loadReactions()         { return JSON.parse(localStorage.getItem(REACTIONS_KEY) || "{}"); }
function saveReactions(r)        { localStorage.setItem(REACTIONS_KEY, JSON.stringify(r)); }
function loadComments()          { return JSON.parse(localStorage.getItem(COMMENTS_KEY)  || "{}"); }
function saveComments(c)         { localStorage.setItem(COMMENTS_KEY,  JSON.stringify(c)); }

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast-msg ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}

function truncate(text, maxLen = 60) {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Reaktioner ────────────────────────────────────────────────────────────

function getReaction(articleId) {
  return loadReactions()[articleId] || { likes: 0, dislikes: 0 };
}

function addReaction(articleId, type) {
  const reactions = loadReactions();
  if (!reactions[articleId]) reactions[articleId] = { likes: 0, dislikes: 0 };
  reactions[articleId][type]++;
  saveReactions(reactions);
}

// ─── Kommentarer ───────────────────────────────────────────────────────────

function getComments(articleId) {
  return loadComments()[articleId] || [];
}

function addComment(articleId, text) {
  const all = loadComments();
  if (!all[articleId]) all[articleId] = [];
  all[articleId].push({ text, date: new Date().toISOString() });
  saveComments(all);
}

// ─── Engagement-sektion ────────────────────────────────────────────────────

function createEngagementSection(articleId) {
  const reaction = getReaction(articleId);
  const comments = getComments(articleId);

  const section = document.createElement("div");
  section.className = "engagement-section";
  section.dataset.articleId = articleId;

  const reactionRow = document.createElement("div");
  reactionRow.className = "reaction-row";

  const likeBtn = document.createElement("button");
  likeBtn.className = "reaction-btn like-btn";
  likeBtn.innerHTML = `<span class="reaction-icon">👍</span> <span class="reaction-count">${reaction.likes}</span>`;
  likeBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    addReaction(articleId, "likes");
    likeBtn.querySelector(".reaction-count").textContent =
      parseInt(likeBtn.querySelector(".reaction-count").textContent) + 1;
    likeBtn.classList.add("reacted");
    setTimeout(() => likeBtn.classList.remove("reacted"), 300);
  });

  const dislikeBtn = document.createElement("button");
  dislikeBtn.className = "reaction-btn dislike-btn";
  dislikeBtn.innerHTML = `<span class="reaction-icon">👎</span> <span class="reaction-count">${reaction.dislikes}</span>`;
  dislikeBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    addReaction(articleId, "dislikes");
    dislikeBtn.querySelector(".reaction-count").textContent =
      parseInt(dislikeBtn.querySelector(".reaction-count").textContent) + 1;
    dislikeBtn.classList.add("reacted");
    setTimeout(() => dislikeBtn.classList.remove("reacted"), 300);
  });

  const toggleCommentsBtn = document.createElement("button");
  toggleCommentsBtn.className = "toggle-comments-btn";
  toggleCommentsBtn.innerHTML = `💬 ${comments.length} kommentar${comments.length !== 1 ? "er" : ""}`;

  reactionRow.appendChild(likeBtn);
  reactionRow.appendChild(dislikeBtn);
  reactionRow.appendChild(toggleCommentsBtn);

  const commentPanel = document.createElement("div");
  commentPanel.className = "comment-panel";
  commentPanel.style.display = "none";

  const commentList = document.createElement("div");
  commentList.className = "comment-list";

  function renderComments() {
    const current = getComments(articleId);
    commentList.innerHTML = "";
    if (current.length === 0) {
      commentList.innerHTML = `<p class="no-comments">Inga kommentarer ännu. Bli den första!</p>`;
    } else {
      current.forEach(c => {
        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `<p class="comment-text">${escapeHtml(c.text)}</p><small class="comment-date">${formatDate(c.date)}</small>`;
        commentList.appendChild(item);
      });
    }
  }
  renderComments();

  const commentForm = document.createElement("div");
  commentForm.className = "comment-form";

  const commentInput = document.createElement("textarea");
  commentInput.className = "comment-input";
  commentInput.placeholder = "Skriv en kommentar…";

  const commentSubmit = document.createElement("button");
  commentSubmit.className = "comment-submit-btn";
  commentSubmit.textContent = "Skicka";

  commentSubmit.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const text = commentInput.value.trim();
    if (!text) { showToast("⚠️ Kommentaren kan inte vara tom.", "danger"); return; }
    addComment(articleId, text);
    commentInput.value = "";
    renderComments();
    const newCount = getComments(articleId).length;
    toggleCommentsBtn.innerHTML = `💬 ${newCount} kommentar${newCount !== 1 ? "er" : ""}`;
    showToast("💬 Kommentaren publicerades!", "success");
  });

  toggleCommentsBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const open = commentPanel.style.display !== "none";
    commentPanel.style.display = open ? "none" : "block";
    toggleCommentsBtn.classList.toggle("active", !open);
  });

  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentSubmit);
  commentPanel.appendChild(commentList);
  commentPanel.appendChild(commentForm);
  section.appendChild(reactionRow);
  section.appendChild(commentPanel);
  return section;
}

// ─── Statiska artiklar ─────────────────────────────────────────────────────

function initStaticArticles() {
  document.querySelectorAll("article.card:not(.dynamic-article)").forEach((articleEl) => {
    const titleEl = articleEl.querySelector(".card-title");
    if (!titleEl) return;

    // Matcha mot STATIC_ARTICLES baserat på titel
    const match = STATIC_ARTICLES.find(a =>
      titleEl.textContent.trim().startsWith(a.title.slice(0, 30))
    );
    if (!match) return;

    articleEl.dataset.articleId = match.id;
    const cardBody = articleEl.querySelector(".card-body");
    if (cardBody) cardBody.appendChild(createEngagementSection(match.id));

    // Gör länken klickbar
    const link = articleEl.closest("a.card-link");
    if (link) link.href = `article.html?id=${match.id}`;
  });
}

// ─── Rendera dynamiska artiklar ────────────────────────────────────────────

function renderArticles() {
  const articles = loadArticles();
  const container = document.getElementById("dynamic-articles");
  container.innerHTML = "";
  updateSenasteNytt();

  if (articles.length === 0) {
    container.innerHTML = `<p class="text-muted small">Inga skapade artiklar ännu.</p>`;
    return;
  }

  const categoryColors = {
    AI: "danger", Hårdvara: "primary", Mjukvara: "info",
    Säkerhet: "warning", Startups: "dark", Hållbarhet: "success"
  };

  articles.forEach((article, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "article-wrapper mb-4";
    wrapper.style.cssText = "width:100%;display:block;";

    const badgeColor = categoryColors[article.category] || "secondary";
    const textClass  = article.category === "Säkerhet" ? "text-dark" : "";
    const imageHtml  = article.imageUrl
      ? `<img src="${escapeHtml(article.imageUrl)}" class="card-img-top" alt="${escapeHtml(article.title)}" style="height:220px;object-fit:cover;">`
      : "";

    wrapper.innerHTML = `
      <button class="btn btn-sm btn-danger article-delete-btn" data-index="${index}" title="Radera artikel">
        <i class="bi bi-trash"></i>
      </button>
      <a href="#" class="card-link">
        <article class="card dynamic-article" style="width:100%;" data-article-id="${article.id}">
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
    wrapper.querySelector("a.card-link").href = `article.html?id=${article.id}`;
    wrapper.querySelector(".card-body").appendChild(createEngagementSection(String(article.id)));
  });

  container.querySelectorAll(".article-delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      deleteArticle(parseInt(btn.dataset.index));
    });
  });
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

function createArticle(title, content, category, imageUrl) {
  const articles = loadArticles();
  articles.unshift({ id: Date.now(), title, content, category, imageUrl, date: new Date().toISOString() });
  saveArticles(articles);
  renderArticles();
  showToast("✅ Artikeln skapades!", "success");
}

function deleteArticle(index) {
  const articles = loadArticles();
  articles.splice(index, 1);
  saveArticles(articles);
  renderArticles();
  showToast("🗑️ Artikeln raderades.", "danger");
}

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);

  const articleCol = document.querySelector(".col-md-8");

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn btn-sm mb-3";
  toggleBtn.style.cssText = "background:#2d3f55;color:#fff;";
  toggleBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Ny artikel`;
  articleCol.insertBefore(toggleBtn, articleCol.firstChild);

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
        <option>AI</option><option>Hårdvara</option><option>Mjukvara</option>
        <option>Säkerhet</option><option>Startups</option><option>Hållbarhet</option>
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

  const dynamicContainer = document.createElement("div");
  dynamicContainer.id = "dynamic-articles";
  dynamicContainer.style.width = "100%";
  articleCol.insertBefore(dynamicContainer, formSection.nextSibling);

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
    if (!title || !content) { showToast("⚠️ Titel och innehåll krävs.", "danger"); return; }
    createArticle(title, content, category, imageUrl);
    document.getElementById("art-title").value   = "";
    document.getElementById("art-content").value = "";
    document.getElementById("art-image").value   = "";
    formSection.style.display = "none";
    toggleBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Ny artikel`;
  });

  renderArticles();
  updateSenasteNytt();
  initStaticArticles();
});

// ─── Senaste nytt (sidebar) ────────────────────────────────────────────────

function updateSenasteNytt() {
  const articles = loadArticles();
  const list = document.querySelector(".card-header.h5")?.closest(".card")?.querySelector(".list-group");
  if (!list) return;

  list.querySelectorAll(".dynamic-news-item").forEach(el => el.remove());

  const categoryColors = {
    AI: "danger", Hårdvara: "primary", Mjukvara: "info",
    Säkerhet: "warning", Startups: "dark", Hållbarhet: "success"
  };

  [...articles].reverse().forEach(article => {
    const badgeColor = categoryColors[article.category] || "secondary";
    const textClass  = article.category === "Säkerhet" ? "text-dark" : "";
    const li = document.createElement("li");
    li.className = "list-group-item dynamic-news-item";
    li.innerHTML = `
      <span class="badge bg-${badgeColor} ${textClass} me-1">${escapeHtml(article.category)}</span>
      <a href="#">${escapeHtml(article.title)}</a><br>
      <small class="text-muted">${formatDate(article.date)}</small>
    `;
    list.insertBefore(li, list.firstChild);
  });
}