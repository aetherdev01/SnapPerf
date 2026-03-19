/* ===================================================
   SnapPerf Download Page — app.js
   =================================================== */
(function () {
  'use strict';

  const REPO    = 'aetherdev01/SnapPerf';
  const API     = `https://api.github.com/repos/${REPO}/releases?per_page=30`;
  const UPLOADER = '@AetherDev22';
  const MIRRORS_KEY = 'snapperf_mirrors_v1';

  /* ── State ─────────────────────────────────────────── */
  let releases    = [];
  let filter      = 'all';
  let query       = '';
  let mirrorTagFocus = null; // tag_name of release being edited for mirrors

  /* ── DOM ────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  const listEl      = $('releasesList');
  const emptyEl     = $('emptyState');
  const errorEl     = $('errorState');
  const errorMsgEl  = $('errorMsg');
  const searchIn    = $('searchInput');
  const searchClr   = $('searchClear');
  const retryBtn    = $('retryBtn');

  const statReleases  = $('statReleases');
  const statDownloads = $('statDownloads');
  const statLatest    = $('statLatest');

  // Changelog modal
  const clOverlay = $('changelogOverlay');
  const clBox     = $('changelogBox');
  const clTag     = $('clTag');
  const clTitle   = $('clTitle');
  const clBody    = $('clBody');
  const clClose   = $('changelogClose');

  // Mirror modal
  const mirrorOverlay    = $('mirrorOverlay');
  const mirrorBox        = $('mirrorBox');
  const mirrorTitleEl    = $('mirrorTitle');
  const mirrorLinksEl    = $('mirrorLinksList');
  const mirrorUrlInput   = $('mirrorUrlInput');
  const mirrorLabelInput = $('mirrorLabelInput');
  const addMirrorBtn     = $('addMirrorBtn');
  const mirrorClose      = $('mirrorClose');

  /* ── Theme ──────────────────────────────────────────── */
  const html       = document.documentElement;
  const toggleBtn  = $('themeToggle');
  const ripple     = $('themeRipple');

  const savedTheme = localStorage.getItem('snapperf_theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  toggleBtn.addEventListener('click', e => {
    const current   = html.getAttribute('data-theme');
    const next      = current === 'dark' ? 'light' : 'dark';
    const rect      = toggleBtn.getBoundingClientRect();
    const cx        = rect.left + rect.width / 2;
    const cy        = rect.top  + rect.height / 2;

    // Compute size to cover full screen from btn origin
    const maxDim = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(window.innerWidth - cx, cy),
      Math.hypot(cx, window.innerHeight - cy),
      Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
    ) * 2;

    const size = maxDim;

    // Position ripple
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${cx - size / 2}px;
      top: ${cy - size / 2}px;
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      transform: scale(0);
      opacity: 1;
    `;

    ripple.className = `theme-ripple ripple-${next}`;

    // After ripple peaks, apply theme
    setTimeout(() => {
      html.setAttribute('data-theme', next);
      localStorage.setItem('snapperf_theme', next);
    }, 200);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.className = 'theme-ripple';
      ripple.style.cssText = '';
    }, 620);
  });

  /* ── Mirrors storage ─────────────────────────────────── */
  function getMirrors() {
    try { return JSON.parse(localStorage.getItem(MIRRORS_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveMirrors(data) {
    localStorage.setItem(MIRRORS_KEY, JSON.stringify(data));
  }

  function getMirrorsForTag(tag) {
    return getMirrors()[tag] || [];
  }

  function addMirrorForTag(tag, url, label) {
    const all = getMirrors();
    if (!all[tag]) all[tag] = [];
    all[tag].push({ url, label: label || url });
    saveMirrors(all);
  }

  function deleteMirrorForTag(tag, idx) {
    const all = getMirrors();
    if (!all[tag]) return;
    all[tag].splice(idx, 1);
    saveMirrors(all);
  }

  /* ── Fetch ──────────────────────────────────────────── */
  async function fetchReleases() {
    showSkeleton();
    try {
      const r = await fetch(API, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error('Unexpected API format');
      releases = data;
      computeStats(data);
      renderFiltered();
    } catch (err) {
      showError(err.message);
    }
  }

  /* ── Stats ──────────────────────────────────────────── */
  function computeStats(data) {
    const totalDL   = data.reduce((s, r) =>
      s + r.assets.reduce((a, x) => a + (x.download_count || 0), 0), 0);
    const stable    = data.find(r => !r.prerelease);
    statReleases.textContent  = data.length;
    statDownloads.textContent = fmtNum(totalDL);
    statLatest.textContent    = stable ? stable.tag_name : (data[0]?.tag_name || '—');
  }

  /* ── Render ──────────────────────────────────────────── */
  function renderFiltered() {
    const q = query.toLowerCase();
    const filtered = releases.filter(r => {
      const ok = filter === 'all'    ? true
               : filter === 'stable' ? !r.prerelease
               : filter === 'beta'   ? r.prerelease : true;
      const match = !q
        || r.tag_name.toLowerCase().includes(q)
        || (r.name  || '').toLowerCase().includes(q)
        || (r.body  || '').toLowerCase().includes(q);
      return ok && match;
    });

    clearList();

    if (!filtered.length) { showEmpty(); return; }
    hideEmpty(); hideError();

    filtered.forEach((r, i) => {
      const card = buildCard(r, i);
      listEl.appendChild(card);
    });
  }

  /* ── Card ───────────────────────────────────────────── */
  function buildCard(r, idx) {
    const pre    = r.prerelease;
    const tag    = r.tag_name;
    const name   = r.name || tag;
    const date   = fmtDate(r.published_at);
    const totalDL = r.assets.reduce((a, x) => a + (x.download_count || 0), 0);
    const mirrors = getMirrorsForTag(tag);

    const card = mk('div', 'release-card');
    card.style.animationDelay = `${idx * 55}ms`;

    /* ── Top section ── */
    const top = mk('div', 'card-top');

    // Left: version/name/meta
    const info = mk('div', '');
    info.style.flex = '1';

    const vRow = mk('div', 'card-version-row');
    const vEl  = mk('span', 'card-version');
    vEl.textContent = tag;
    const tagEl = mk('span', pre ? 'tag-beta' : 'tag-stable');
    tagEl.textContent = pre ? 'Beta' : 'Stable';
    vRow.append(vEl, tagEl);

    const nameEl = mk('p', 'card-name');
    nameEl.textContent = (name !== tag) ? name : `SnapPerf ${tag}`;

    const meta = mk('div', 'card-meta');
    meta.appendChild(metaItem(calIco(), date));
    meta.appendChild(metaItem(dlIco(), `${fmtNum(totalDL)} downloads`));
    meta.appendChild(metaItem(pkgIco(), `${r.assets.length} file${r.assets.length !== 1 ? 's' : ''}`));

    const uploader = mk('div', 'card-uploader');
    uploader.innerHTML = `${personIco()} Uploaded by <strong>${UPLOADER}</strong>`;

    info.append(vRow, nameEl, meta, uploader);

    // Right: changelog + mirror buttons
    const topRight = mk('div', 'card-top-right');

    const clBtn = mk('button', 'btn-ghost');
    clBtn.innerHTML = `${docIco()} Changelog`;
    clBtn.addEventListener('click', () => openChangelog(r));

    const mirBtn = mk('button', 'btn-ghost');
    mirBtn.innerHTML = `${linkIco()} Mirrors${mirrors.length ? ` (${mirrors.length})` : ''}`;
    mirBtn.dataset.mirrorTag = tag;
    mirBtn.addEventListener('click', () => openMirrors(r, mirBtn));

    topRight.append(clBtn, mirBtn);
    top.append(info, topRight);

    /* ── Asset rows ── */
    const assetsWrap = mk('div', 'card-assets');

    if (!r.assets.length) {
      const empty = mk('p', '');
      empty.textContent = 'No downloadable assets';
      empty.style.cssText = 'font-size:13px;color:var(--text-3);padding:4px 0';
      assetsWrap.appendChild(empty);
    } else {
      r.assets.forEach(a => assetsWrap.appendChild(buildAssetRow(a)));
    }

    /* ── Footer bar: mirror chips ── */
    const footerBar = mk('div', 'card-footer-bar');
    footerBar.id = `mirrorBar_${tag.replace(/[^a-z0-9]/gi, '_')}`;

    const chips = mk('div', 'mirror-chips');
    renderMirrorChips(chips, tag);

    const ghLink = mk('a', 'btn-ghost');
    ghLink.href   = r.html_url;
    ghLink.target = '_blank';
    ghLink.rel    = 'noopener noreferrer';
    ghLink.innerHTML = `${ghIco()} View release`;

    footerBar.append(chips, ghLink);

    card.append(top, assetsWrap, footerBar);
    return card;
  }

  /* ── Render mirror chips into a container ─────────────── */
  function renderMirrorChips(container, tag) {
    container.innerHTML = '';
    const mirrors = getMirrorsForTag(tag);
    if (!mirrors.length) return;

    mirrors.forEach(m => {
      const chip = mk('a', 'mirror-chip');
      chip.href   = m.url;
      chip.target = '_blank';
      chip.rel    = 'noopener noreferrer';
      chip.innerHTML = `${linkIco()} ${m.label}`;
      container.appendChild(chip);
    });
  }

  /* ── Refresh mirror chips on a specific card ──────────── */
  function refreshCardMirrors(tag) {
    const safeId = `mirrorBar_${tag.replace(/[^a-z0-9]/gi, '_')}`;
    const bar    = document.getElementById(safeId);
    if (!bar) return;
    const chips  = bar.querySelector('.mirror-chips');
    if (chips) renderMirrorChips(chips, tag);

    // Also refresh mirror button label
    const mirBtn = bar.closest('.release-card')?.querySelector('[data-mirror-tag]');
    if (mirBtn) {
      const count = getMirrorsForTag(tag).length;
      mirBtn.innerHTML = `${linkIco()} Mirrors${count ? ` (${count})` : ''}`;
    }
  }

  /* ── Asset Row ──────────────────────────────────────── */
  function buildAssetRow(asset) {
    const row  = mk('div', 'asset-row');
    const ico  = mk('div', 'asset-file-icon');
    ico.innerHTML = zipIco();

    const info = mk('div', 'asset-info');
    const fn   = mk('div', 'asset-filename');
    fn.textContent = asset.name;
    const sub  = mk('div', 'asset-sub');
    sub.innerHTML  = `<span>${fmtBytes(asset.size)}</span><span>${fmtNum(asset.download_count)} downloads</span>`;
    info.append(fn, sub);

    const btn = mk('a', 'btn-dl');
    btn.href     = asset.browser_download_url;
    btn.download = '';
    btn.innerHTML = `${dlArrowIco()} Download`;

    row.append(ico, info, btn);
    return row;
  }

  /* ── Meta item helper ───────────────────────────────── */
  function metaItem(iconSvg, text) {
    const el = mk('div', 'card-meta-item');
    el.innerHTML = `${iconSvg}<span>${text}</span>`;
    return el;
  }

  /* ── Changelog modal ────────────────────────────────── */
  function openChangelog(r) {
    clTag.textContent   = r.tag_name;
    clTitle.textContent = r.name || r.tag_name;

    const body = r.body ? r.body.trim() : '*No changelog provided.*';
    clBody.innerHTML = (typeof marked !== 'undefined')
      ? marked.parse(body)
      : `<pre style="white-space:pre-wrap;font-size:13px;color:var(--text-2)">${escHtml(body)}</pre>`;

    openModal(clOverlay);
  }

  clClose.addEventListener('click', () => closeModal(clOverlay));

  /* ── Mirror modal ───────────────────────────────────── */
  function openMirrors(r, triggerBtn) {
    mirrorTagFocus         = r.tag_name;
    mirrorTitleEl.textContent = r.name || r.tag_name;
    mirrorUrlInput.value   = '';
    mirrorLabelInput.value = '';
    renderMirrorList();
    openModal(mirrorOverlay);
  }

  function renderMirrorList() {
    if (!mirrorTagFocus) return;
    mirrorLinksEl.innerHTML = '';
    const mirrors = getMirrorsForTag(mirrorTagFocus);

    if (!mirrors.length) {
      const empty = mk('p', 'mirror-empty');
      empty.textContent = 'No mirror links added yet.';
      mirrorLinksEl.appendChild(empty);
      return;
    }

    mirrors.forEach((m, idx) => {
      const entry  = mk('div', 'mirror-entry');
      const mInfo  = mk('div', 'mirror-entry-info');
      const label  = mk('div', 'mirror-entry-label');
      label.textContent = m.label || m.url;
      const url    = mk('div', 'mirror-entry-url');
      url.textContent = m.url;
      mInfo.append(label, url);

      const del    = mk('button', 'mirror-entry-del');
      del.innerHTML = '✕';
      del.title     = 'Remove';
      del.addEventListener('click', () => {
        deleteMirrorForTag(mirrorTagFocus, idx);
        renderMirrorList();
        refreshCardMirrors(mirrorTagFocus);
      });

      entry.append(mInfo, del);
      mirrorLinksEl.appendChild(entry);
    });
  }

  addMirrorBtn.addEventListener('click', () => {
    const url   = mirrorUrlInput.value.trim();
    const label = mirrorLabelInput.value.trim();
    if (!url) { mirrorUrlInput.focus(); return; }

    try { new URL(url); }
    catch {
      mirrorUrlInput.style.borderColor = '#ff453a';
      setTimeout(() => { mirrorUrlInput.style.borderColor = ''; }, 1200);
      return;
    }

    addMirrorForTag(mirrorTagFocus, url, label || url);
    mirrorUrlInput.value   = '';
    mirrorLabelInput.value = '';
    renderMirrorList();
    refreshCardMirrors(mirrorTagFocus);
  });

  mirrorClose.addEventListener('click', () => closeModal(mirrorOverlay));

  /* ── Modal helpers ──────────────────────────────────── */
  function openModal(overlay) {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }, 260);
  }

  // No backdrop close — only X button closes modal (per requirement)

  /* ── Search ─────────────────────────────────────────── */
  searchIn.addEventListener('input', () => {
    query = searchIn.value;
    searchClr.classList.toggle('show', query.length > 0);
    renderFiltered();
  });

  searchClr.addEventListener('click', () => {
    searchIn.value = '';
    query = '';
    searchClr.classList.remove('show');
    searchIn.focus();
    renderFiltered();
  });

  /* ── Filter pills ───────────────────────────────────── */
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(b => {
        b.classList.remove('active');
        b.removeAttribute('aria-selected');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      filter = btn.dataset.filter;
      renderFiltered();
    });
  });

  /* ── Retry ──────────────────────────────────────────── */
  retryBtn.addEventListener('click', fetchReleases);

  /* ── Disable text selection ─────────────────────────── */
  document.addEventListener('selectstart', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
  });

  document.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('copy', e => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
  });

  /* ── List helpers ───────────────────────────────────── */
  function showSkeleton() {
    listEl.innerHTML = `
      <div class="skel-card" style="height:240px"></div>
      <div class="skel-card" style="height:200px"></div>
      <div class="skel-card" style="height:220px"></div>`;
    emptyEl.hidden = true;
    errorEl.hidden = true;
  }

  function clearList() { listEl.innerHTML = ''; }
  function showEmpty() { emptyEl.hidden = false; errorEl.hidden = true; }
  function hideEmpty() { emptyEl.hidden = true; }
  function showError(msg) {
    clearList();
    errorMsgEl.textContent = msg || 'Unknown error';
    errorEl.hidden   = false;
    emptyEl.hidden   = true;
  }
  function hideError() { errorEl.hidden = true; }

  /* ── Format helpers ─────────────────────────────────── */
  function fmtNum(n) {
    if (!n) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }

  function fmtBytes(b) {
    if (!b) return '—';
    if (b < 1024)      return b + ' B';
    if (b < 1048576)   return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function mk(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  /* ── Inline SVG icons ───────────────────────────────── */
  function calIco()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="2" width="12" height="11" rx="2"/><path d="M1 5h12M5 1v2M9 1v2"/></svg>`; }
  function dlIco()     { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M7 1v8M4 6l3 3 3-3M1 11h12"/></svg>`; }
  function pkgIco()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="5" width="12" height="8" rx="1.5"/><path d="M1 8h12M4.5 1l-2 4h9l-2-4"/></svg>`; }
  function personIco() { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-3 2.7-5 6-5s6 2 6 5"/></svg>`; }
  function docIco()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="1" width="10" height="12" rx="1.5"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3"/></svg>`; }
  function linkIco()   { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5.5 8.5a4 4 0 005.6-5.6L9.5 1.3a4 4 0 00-5.6 5.6"/><path d="M8.5 5.5a4 4 0 00-5.6 5.6l1.6 1.6a4 4 0 005.6-5.6"/></svg>`; }
  function ghIco()     { return `<svg viewBox="0 0 14 14" fill="currentColor"><path d="M7 .175C3.5.175.7 2.95.7 6.4c0 2.75 1.8 5.1 4.3 5.925.3.05.425-.125.425-.275 0-.125-.025-.575-.025-1.075-1.675.35-2.025-.8-2.025-.8-.275-.7-.675-.875-.675-.875-.55-.375.05-.375.05-.375.6.05.925.625.925.625.55.925 1.425.675 1.775.5.05-.4.2-.675.375-.825-1.325-.125-2.725-.65-2.725-2.95 0-.65.225-1.2.625-1.625-.075-.15-.275-.775.075-1.6 0 0 .525-.175 1.7.625.5-.125 1.025-.2 1.55-.2s1.05.075 1.55.2c1.175-.8 1.7-.625 1.7-.625.35.825.15 1.45.075 1.6.4.425.625.975.625 1.625 0 2.3-1.4 2.8-2.75 2.95.225.2.425.575.425 1.175v1.75c0 .15.1.325.425.275 2.5-.825 4.3-3.175 4.3-5.925C13.3 2.95 10.5.175 7 .175z"/></svg>`; }
  function zipIco()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="1" width="10" height="12" rx="1.5"/><path d="M5.5 1v3.5L7 5.5l1.5-1V1M7 5.5v2"/><circle cx="7" cy="9.5" r="1" fill="currentColor" stroke="none"/></svg>`; }
  function dlArrowIco(){ return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 1v8M4 6.5l3 3 3-3M1 11h12"/></svg>`; }

  /* ── Init ───────────────────────────────────────────── */
  fetchReleases();

})();
