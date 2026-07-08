/* ============================================================
   Directorio de Sitios — Lógica principal (Vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  const CONFIG = window.SITE_CONFIG;
  const isDemo = !CONFIG.API_URL || CONFIG.API_URL === "PASTE_YOUR_WEB_APP_URL_HERE";

  // ---------- Referencias DOM ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    searchInput: $("searchInput"),
    clearSearch: $("clearSearch"),
    categoryFilter: $("categoryFilter"),
    typeFilter: $("typeFilter"),
    addBtn: $("addBtn"),
    resultCount: $("resultCount"),
    container: $("sitesContainer"),
    loadingState: $("loadingState"),
    errorState: $("errorState"),
    errorText: $("errorText"),
    retryBtn: $("retryBtn"),
    emptyState: $("emptyState"),
    emptyText: $("emptyText"),
    footerMeta: $("footerMeta"),
    themeToggle: $("themeToggle"),
    // Add modal
    addModal: $("addModal"),
    addForm: $("addForm"),
    fName: $("f-name"),
    fDescription: $("f-description"),
    fCategory: $("f-category"),
    fType: $("f-type"),
    fPrice: $("f-price"),
    fLink: $("f-link"),
    fPassword: $("f-password"),
    formError: $("formError"),
    submitBtn: $("submitBtn"),
    // Detail modal
    detailModal: $("detailModal"),
    detailBody: $("detailBody"),
    detailTitle: $("detailTitle"),
    // Toast
    toast: $("toast"),
  };

  let allSites = [];
  let activeDetailSite = null;

  // ---------- Init ----------
  function init() {
    initTheme();
    populateSelects();
    bindEvents();
    loadSites();
  }

  // ---------- Tema ----------
  function initTheme() {
    const saved = localStorage.getItem("dir-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dir-theme", next);
  }

  // ---------- Selects ----------
  function populateSelects() {
    const cats = [...CONFIG.CATEGORIES].sort((a, b) => a.localeCompare(b, "es"));
    const types = [...CONFIG.TYPES].sort((a, b) => a.localeCompare(b, "es"));

    const catOpts = cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    const typeOpts = types.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");

    els.categoryFilter.insertAdjacentHTML("beforeend", catOpts);
    els.typeFilter.insertAdjacentHTML("beforeend", typeOpts);
    els.fCategory.innerHTML = `<option value="" disabled selected>Selecciona…</option>` + catOpts;
    els.fType.innerHTML = `<option value="" disabled selected>Selecciona…</option>` + typeOpts;
  }

  // ---------- Eventos ----------
  function bindEvents() {
    let searchTimer;
    els.searchInput.addEventListener("input", () => {
      els.clearSearch.style.display = els.searchInput.value ? "grid" : "none";
      clearTimeout(searchTimer);
      searchTimer = setTimeout(render, 150);
    });
    els.clearSearch.addEventListener("click", () => {
      els.searchInput.value = "";
      els.clearSearch.style.display = "none";
      els.searchInput.focus();
      render();
    });
    els.categoryFilter.addEventListener("change", render);
    els.typeFilter.addEventListener("change", render);
    els.retryBtn.addEventListener("click", loadSites);
    els.themeToggle.addEventListener("click", toggleTheme);
    els.addBtn.addEventListener("click", openAddModal);

    // Add form
    els.addForm.addEventListener("submit", handleSubmit);
    els.addForm.addEventListener("input", () => {
      if (!els.formError.hidden) { els.formError.hidden = true; }
    });

    // Modal close (delegación)
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) {
        closeAllModals();
      }
      if (e.target.classList.contains("modal-overlay")) {
        closeAllModals();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllModals();
    });

    // Delegación para botón "ojo" (detalle en móvil)
    els.container.addEventListener("click", (e) => {
      const eyeBtn = e.target.closest(".eye-btn");
      if (eyeBtn) {
        const id = eyeBtn.getAttribute("data-id");
        const site = allSites.find(s => String(s.id) === String(id));
        if (site) openDetail(site);
      }
    });
  }

  // ---------- Carga de datos ----------
  async function loadSites() {
    showState("loading");

    if (isDemo) {
      allSites = CONFIG.DEMO_DATA.map((s, i) => ({
        id: i + 1, timestamp: null, ...s
      }));
      render();
      showToast("Modo demo: configura API_URL en js/config.js para usar tu Google Sheet");
      return;
    }

    try {
      const res = await fetch(CONFIG.API_URL, { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error del servidor");
      allSites = (json.data || []).filter(s => s && s.name);
      render();
    } catch (err) {
      console.error(err);
      els.errorText.textContent = "No se pudieron cargar los sitios. Verifica la URL de tu API en config.js.";
      showState("error");
    }
  }

  // ---------- Render ----------
  function getFiltered() {
    const q = els.searchInput.value.trim().toLowerCase();
    const cat = els.categoryFilter.value;
    const type = els.typeFilter.value;

    return allSites.filter(s => {
      if (cat && s.category !== cat) return false;
      if (type && s.type !== type) return false;
      if (q) {
        const haystack = [s.name, s.description, s.category, s.type, s.price, s.link]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function render() {
    const filtered = getFiltered();
    els.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "sitio" : "sitios"}` +
      (filtered.length !== allSites.length ? ` de ${allSites.length}` : "");

    if (filtered.length === 0) {
      els.emptyText.textContent = allSites.length === 0
        ? "Aún no hay sitios guardados. ¡Añade el primero!"
        : "No se encontraron sitios con esos filtros.";
      showState("empty");
      return;
    }
    hideStates();

    // Agrupar por categoría y ordenar
    const groups = {};
    filtered.forEach(s => {
      const c = s.category || "Sin categoría";
      (groups[c] = groups[c] || []).push(s);
    });
    const sortedCats = Object.keys(groups).sort((a, b) => a.localeCompare(b, "es"));

    const html = sortedCats.map(cat => {
      const items = groups[cat]
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
      const cards = items.map(cardHtml).join("");
      return `
        <section class="category-section">
          <div class="category-header">
            <h2 class="category-name">${esc(cat)}</h2>
            <span class="category-count">${items.length}</span>
          </div>
          <div class="sites-grid">${cards}</div>
        </section>`;
    }).join("");

    els.container.innerHTML = html;
    updateFooterMeta();
  }

  function cardHtml(s) {
    const host = safeHost(s.link);
    return `
      <article class="site-card" data-id="${esc(String(s.id))}">
        <div class="card-top">
          <h3 class="card-name" title="${esc(s.name)}">${esc(s.name)}</h3>
          <div class="card-actions">
            <button class="eye-btn" data-id="${esc(String(s.id))}" type="button" aria-label="Ver detalles de ${esc(s.name)}" title="Ver detalles">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        <div class="card-badges">
          ${s.type ? `<span class="badge type">${esc(s.type)}</span>` : ""}
          ${s.price ? `<span class="badge price">${esc(s.price)}</span>` : ""}
        </div>
        ${s.description ? `<p class="card-desc">${esc(s.description)}</p>` : ""}
        <a class="card-link" href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>${esc(host || "Abrir enlace")}</span>
        </a>
      </article>`;
  }

  // ---------- Detail modal (móvil) ----------
  function openDetail(s) {
    activeDetailSite = s;
    els.detailTitle.textContent = s.name;
    const host = safeHost(s.link);
    els.detailBody.innerHTML = `
      ${s.description ? `<div class="detail-row"><span class="detail-label">Descripción</span><span class="detail-value">${esc(s.description)}</span></div>` : ""}
      <div class="detail-row"><span class="detail-label">Categoría</span><span class="detail-value">${esc(s.category || "—")}</span></div>
      <div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value detail-badges">${s.type ? `<span class="badge type">${esc(s.type)}</span>` : "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Precio</span><span class="detail-value">${s.price ? `<span class="badge price">${esc(s.price)}</span>` : "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Enlace</span><span class="detail-value"><a href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">${esc(host || s.link || "—")}</a></span></div>
      <a class="detail-link-btn" href="${esc(s.link)}" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        Abrir sitio
      </a>`;
    openModal(els.detailModal);
  }

  // ---------- Add modal ----------
  function openAddModal() {
    els.addForm.reset();
    els.formError.hidden = true;
    els.submitBtn.disabled = false;
    els.submitBtn.querySelector(".btn-label").textContent = "Guardar sitio";
    els.submitBtn.querySelector(".spinner").hidden = true;
    if (CONFIG.ADD_PASSWORD) {
      els.fPassword.value = CONFIG.ADD_PASSWORD;
    }
    openModal(els.addModal);
    setTimeout(() => els.fName.focus(), 50);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    els.formError.hidden = true;

    const data = {
      name: els.fName.value.trim(),
      description: els.fDescription.value.trim(),
      category: els.fCategory.value,
      type: els.fType.value,
      price: els.fPrice.value.trim(),
      link: els.fLink.value.trim(),
      password: els.fPassword.value,
    };

    if (!data.name || !data.category || !data.type || !data.link) {
      showFormError("Completa los campos obligatorios (*).");
      return;
    }
    if (!/^https?:\/\/.+/i.test(data.link)) {
      showFormError("El enlace debe comenzar con http:// o https://");
      return;
    }

    if (isDemo) {
      const newSite = { id: Date.now(), timestamp: new Date().toISOString(), ...data };
      delete newSite.password;
      allSites.push(newSite);
      closeAllModals();
      render();
      showToast("Sitio añadido (modo demo). Configura API_URL para guardarlo en tu Google Sheet.");
      return;
    }

    // Enviar a Apps Script
    setLoading(true);
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al guardar");
      closeAllModals();
      showToast("Sitio añadido correctamente");
      await loadSites();
    } catch (err) {
      console.error(err);
      showFormError("No se pudo guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function setLoading(loading) {
    els.submitBtn.disabled = loading;
    els.submitBtn.querySelector(".btn-label").textContent = loading ? "Guardando…" : "Guardar sitio";
    els.submitBtn.querySelector(".spinner").hidden = !loading;
  }
  function showFormError(msg) {
    els.formError.textContent = msg;
    els.formError.hidden = false;
  }

  // ---------- Modal helpers ----------
  function openModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeAllModals() {
    els.addModal.hidden = true;
    els.detailModal.hidden = true;
    document.body.style.overflow = "";
    activeDetailSite = null;
  }

  // ---------- State helpers ----------
  function showState(state) {
    els.container.innerHTML = "";
    els.loadingState.hidden = state !== "loading";
    els.errorState.hidden = state !== "error";
    els.emptyState.hidden = state !== "empty";
  }
  function hideStates() {
    els.loadingState.hidden = true;
    els.errorState.hidden = true;
    els.emptyState.hidden = true;
  }

  function updateFooterMeta() {
    if (isDemo) {
      els.footerMeta.textContent = "Modo demostración";
    } else {
      els.footerMeta.textContent = `${allSites.length} sitios en total`;
    }
  }

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg, isError) {
    clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.classList.toggle("error", !!isError);
    els.toast.hidden = false;
    requestAnimationFrame(() => els.toast.classList.add("show"));
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("show");
      setTimeout(() => { els.toast.hidden = true; }, 250);
    }, 3200);
  }

  // ---------- Utilidades ----------
  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function safeHost(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch { return ""; }
  }

  // ---------- Arranque ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();