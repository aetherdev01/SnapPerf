/* ===================================================
   SnapPerf Download Page — app.js
   GitHub Releases API Integration
   =================================================== */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────── */
  const REPO    = 'aetherdev01/SnapPerf';
  const API_URL = `https://api.github.com/repos/${REPO}/releases`;
  const PER_PAGE = 30;

  /* ── State ──────────────────────────────────────── */
  let allReleases   = [];
  let activeFilter  = 'all';
  let searchQuery   = '';
  let staggerIndex  = 0;

  /* ── DOM refs ───────────────────────────────────── */
  const listEl      = document.getElementById('releasesList');
  const emptyEl     = document.getElementById('emptyState');
  const errorEl     = document.getElementById('errorState');
  const errorMsgEl  = document.getElementById('errorMsg');
  const searchIn    = document.getElementById('searchInput');
  const searchClr   = document.getElementById('searchClear');
  const retryBtn    = document.getElementById('retryBtn');
  const modalOv     = document.getElementById('modalOverlay');
  const modalClose  = document.getElementById('modalClose');
  const modalTag    = document.getElementById('modalTag');
  const modalTitle  = document.getElementById('modalTitle');
  const modalBody   = document.getElementById('modalBody');
  const statTotal   = document.getElementById('statTotal');
  const statDL      = document.getElementById('statDownloads');
  const statLatest  = document.getElementById('statLatest');

  /* ── Fetch releases ──────────────────────────────── */
  async function fetchReleases() {
    showSkeleton();
    try {
      const res = await fetch(`${API_URL}?per_page=${PER_PAGE}&page=1`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!res.ok) {
        throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected API response');

      allReleases = data;
      computeStats(data);
      renderFiltered();
    } catch (err) {
      showError(err.message);
      console.error('[SnapPerf] Fetch error:', err);
    }
  }

  /* ── Stats ──────────────────────────────────────── */
  function computeStats(releases) {
    const totalDL = releases.reduce((acc, r) => {
      return acc + r.assets.reduce((a2, asset) => a2 + (asset.download_count || 0), 0);
    }, 0);

    const latestStable = releases.find(r => !r.prerelease);
    const latestVer    = latestStable ? latestStable.tag_name : (releases[0]?.tag_name || '—');

    statTotal.textContent  = releases.length;
    statDL.textContent     = formatNum(totalDL);
    statLatest.textContent = latestVer;
  }

  /* ── Render ──────────────────────────────────────── */
  function renderFiltered() {
    const q = searchQuery.toLowerCase().trim();

    const filtered = allReleases.filter(r => {
      const matchFilter =
        activeFilter === 'all'    ? true :
        activeFilter === 'stable' ? !r.prerelease :
        activeFilter === 'beta'   ? r.prerelease  : true;

      const matchSearch = !q ||
        r.tag_name.toLowerCase().includes(q)  ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.body || '').toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });

    clearList();
    staggerIndex = 0;

    if (filtered.length === 0) {
      showEmpty();
      return;
    }

    hideEmpty();
    hideError();

    filtered.forEach((release, i) => {
      const card = buildCard(release, i);
      listEl.appendChild(card);
    });
  }

  /* ── Card builder ───────────────────────────────── */
  function buildCard(release, index) {
    const isPrerelease = release.prerelease;
    const version      = release.tag_name;
    const name         = release.name || version;
    const date         = formatDate(release.published_at);
    const totalDL      = release.assets.reduce((a, x) => a + (x.download_count || 0), 0);

    // Get primary asset (first .zip)
    const assets = release.assets || [];

    const card = el('div', 'release-card');
    card.style.animationDelay = `${index * 70}ms`;
    card.setAttribute('data-id', release.id);

    /* ─ Card Main ─ */
    const main = el('div', 'card-main');

    // Left column
    const left = el('div', 'card-left');
    const iconRing = el('div', 'card-icon-ring');
    iconRing.innerHTML = moduleIconSVG();
    const typeBadge = el('span', `card-type-badge ${isPrerelease ? 'badge-beta' : 'badge-stable'}`);
    typeBadge.textContent = isPrerelease ? 'Beta' : 'Stable';
    left.append(iconRing, typeBadge);

    // Right column
    const right = el('div', 'card-right');

    // Header
    const header = el('div', 'card-header');
    const versionEl = el('span', 'card-version');
    versionEl.textContent = version;
    const nameEl = el('span', 'card-name');
    nameEl.textContent = name !== version ? name : '';
    header.append(versionEl, nameEl);

    // Date
    const dateEl = el('div', 'card-date');
    dateEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${date}`;

    // Metrics
    const metrics = el('div', 'card-metrics');
    metrics.append(
      metricEl(totalDL > 0 ? formatNum(totalDL) : '—', 'Downloads'),
      metricEl(assets.length > 0 ? formatBytes(assets[0].size) : '—', 'Size'),
      metricEl(assets.length > 0 ? String(assets.length) : '—', 'Assets')
    );

    // Assets rows
    const assetsWrap = el('div', 'card-assets');
    if (assets.length === 0) {
      const noAsset = el('div', 'asset-row');
      noAsset.innerHTML = '<span style="color:var(--text-3);font-size:13px;">No downloadable assets</span>';
      assetsWrap.appendChild(noAsset);
    } else {
      assets.forEach(asset => {
        assetsWrap.appendChild(buildAssetRow(asset));
      });
    }

    right.append(header, dateEl, metrics, assetsWrap);
    main.append(left, right);

    /* ─ Card Footer ─ */
    const footer = el('div', 'card-footer');

    const clBtn = el('button', 'btn-changelog');
    clBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Changelog`;
    clBtn.addEventListener('click', () => openModal(release));

    const ghLink = el('a', 'card-gh-link');
    ghLink.href   = release.html_url;
    ghLink.target = '_blank';
    ghLink.rel    = 'noopener noreferrer';
    ghLink.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>View on GitHub`;

    footer.append(clBtn, ghLink);

    card.append(main, footer);
    return card;
  }

  /* ── Asset Row ──────────────────────────────────── */
  function buildAssetRow(asset) {
    const row = el('div', 'asset-row');

    const ico = el('div', 'asset-ico');
    ico.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

    const info = el('div', 'asset-info');
    const nameEl = el('div', 'asset-name');
    nameEl.textContent = asset.name;
    const metaEl = el('div', 'asset-meta');
    metaEl.innerHTML = `<span>${formatBytes(asset.size)}</span><span>${formatNum(asset.download_count)} downloads</span>`;
    info.append(nameEl, metaEl);

    const dlBtn = el('a', 'btn-dl');
    dlBtn.href = asset.browser_download_url;
    dlBtn.download = '';
    dlBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Download</span>`;

    row.append(ico, info, dlBtn);
    return row;
  }

  /* ── Metric element ─────────────────────────────── */
  function metricEl(val, lbl) {
    const m = el('div', 'metric');
    const v = el('span', 'metric-val');
    v.textContent = val;
    const l = el('span', 'metric-lbl');
    l.textContent = lbl;
    m.append(v, l);
    return m;
  }

  /* ── Modal ──────────────────────────────────────── */
  function openModal(release) {
    modalTag.textContent   = release.tag_name;
    modalTitle.textContent = release.name || release.tag_name;

    const body = release.body || '_No changelog provided._';
    // Use marked if available, else plain text
    if (typeof marked !== 'undefined') {
      modalBody.innerHTML = marked.parse(body);
    } else {
      modalBody.innerHTML = `<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;color:var(--text-2)">${escapeHtml(body)}</pre>`;
    }

    modalOv.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOv.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOv.addEventListener('click', e => { if (e.target === modalOv) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Search ──────────────────────────────────────── */
  searchIn.addEventListener('input', () => {
    searchQuery = searchIn.value;
    searchClr.classList.toggle('visible', searchQuery.length > 0);
    renderFiltered();
  });

  searchClr.addEventListener('click', () => {
    searchIn.value = '';
    searchQuery    = '';
    searchClr.classList.remove('visible');
    searchIn.focus();
    renderFiltered();
  });

  /* ── Filter tabs ─────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeFilter = btn.dataset.filter;
      renderFiltered();
    });
  });

  /* ── Retry ───────────────────────────────────────── */
  retryBtn.addEventListener('click', fetchReleases);

  /* ── Helpers ─────────────────────────────────────── */
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function formatNum(n) {
    if (n === undefined || n === null) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function moduleIconSVG() {
    return `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px">
      <polygon points="20,3 37,12 37,28 20,37 3,28 3,12" fill="none" stroke="url(#ci)" stroke-width="1.5"/>
      <path d="M13 20 L17 15 L21 20 L25 15" stroke="url(#cl)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="20" cy="20" r="2" fill="url(#cd)"/>
      <defs>
        <linearGradient id="ci" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00aaff"/>
          <stop offset="100%" stop-color="#0044ff"/>
        </linearGradient>
        <linearGradient id="cl" x1="13" y1="17" x2="25" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00e5ff"/>
          <stop offset="100%" stop-color="#0088ff"/>
        </linearGradient>
        <radialGradient id="cd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="100%" stop-color="#00ccff"/>
        </radialGradient>
      </defs>
    </svg>`;
  }

  function showSkeleton() {
    listEl.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>`;
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
  }

  function clearList() {
    listEl.innerHTML = '';
  }

  function showEmpty() {
    emptyEl.style.display = '';
    errorEl.style.display = 'none';
  }

  function hideEmpty() {
    emptyEl.style.display = 'none';
  }

  function showError(msg) {
    clearList();
    errorMsgEl.textContent = msg || 'Unknown error';
    errorEl.style.display = '';
    emptyEl.style.display = 'none';
  }

  function hideError() {
    errorEl.style.display = 'none';
  }

  /* ── No text selection enforcement ──────────────── */
  document.addEventListener('selectstart', e => {
    // Allow selection only inside search input
    if (e.target === searchIn) return;
    e.preventDefault();
  });

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
  });

  document.addEventListener('copy', e => {
    if (e.target === searchIn) return;
    e.preventDefault();
  });

  /* ── Init ────────────────────────────────────────── */
  fetchReleases();

})();
