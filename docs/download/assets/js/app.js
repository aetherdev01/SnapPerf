/* =========================================================
   SnapPerf · app.js
   ========================================================= */
(function () {
  'use strict';

  const REPO        = 'aetherdev01/SnapPerf';
  const API_URL     = `https://api.github.com/repos/${REPO}/releases?per_page=30`;
  const UPLOADER    = '@AetherDev22';
  const MIR_KEY     = 'sp_mirrors_v1';

  /* ── state ───────────────────────────────────────────── */
  let releases   = [];
  let activeFilter = 'all';
  let searchQ    = '';
  let mirFocusTag = null;

  /* ── DOM ─────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  const listEl    = $('releasesList');
  const emptyEl   = $('emptyState');
  const errorEl   = $('errorState');
  const errorMsg  = $('errorMsg');
  const searchIn  = $('searchInput');
  const searchClr = $('searchClear');

  const stRel  = $('statReleases');
  const stDl   = $('statDownloads');
  const stLast = $('statLatest');

  // Changelog modal
  const clOv    = $('clOverlay');
  const clTag   = $('clTag');
  const clTitle = $('clTitle');
  const clBody  = $('clBody');
  const clClose = $('clClose');

  // Mirror modal
  const mirOv    = $('mirOverlay');
  const mirTitle = $('mirTitle');
  const mirList  = $('mirList');
  const mirUrl   = $('mirUrl');
  const mirLabel = $('mirLabel');
  const mirAdd   = $('mirAdd');
  const mirClose = $('mirClose');

  /* ── Theme ───────────────────────────────────────────── */
  const html      = document.documentElement;
  const themeBtn  = $('themeBtn');
  const rippleEl  = $('tRipple');

  // Apply saved theme on load
  const saved = localStorage.getItem('sp_theme') || 'dark';
  html.setAttribute('data-theme', saved);

  themeBtn.addEventListener('click', () => {
    const cur  = html.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';

    // Ripple from button center
    const r   = themeBtn.getBoundingClientRect();
    const cx  = r.left + r.width / 2;
    const cy  = r.top  + r.height / 2;
    const sz  = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(window.innerWidth - cx, cy),
      Math.hypot(cx, window.innerHeight - cy),
      Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
    ) * 2.1;

    Object.assign(rippleEl.style, {
      width:  sz + 'px',
      height: sz + 'px',
      left:   (cx - sz / 2) + 'px',
      top:    (cy - sz / 2) + 'px',
    });
    rippleEl.className = `t-ripple rip-${next}`;

    setTimeout(() => {
      html.setAttribute('data-theme', next);
      localStorage.setItem('sp_theme', next);
    }, 210);

    setTimeout(() => {
      rippleEl.className = 't-ripple';
      rippleEl.removeAttribute('style');
    }, 620);
  });

  /* ── Mirror storage ──────────────────────────────────── */
  function getMirrors() {
    try { return JSON.parse(localStorage.getItem(MIR_KEY) || '{}'); } catch { return {}; }
  }
  function saveMirrors(d) { localStorage.setItem(MIR_KEY, JSON.stringify(d)); }
  function getTagMirrors(tag) { return getMirrors()[tag] || []; }
  function addTagMirror(tag, url, label) {
    const d = getMirrors();
    if (!d[tag]) d[tag] = [];
    d[tag].push({ url, label: label || url });
    saveMirrors(d);
  }
  function delTagMirror(tag, idx) {
    const d = getMirrors();
    if (d[tag]) { d[tag].splice(idx, 1); saveMirrors(d); }
  }

  /* ── Fetch ───────────────────────────────────────────── */
  async function fetchReleases() {
    showSkel();
    try {
      const res = await fetch(API_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error(`GitHub API: HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected API response format');

      releases = data;
      updateStats(data);
      renderList();
    } catch (e) {
      showError(e.message);
    }
  }

  /* ── Stats ───────────────────────────────────────────── */
  function updateStats(data) {
    const totalDl = data.reduce((s, r) =>
      s + r.assets.reduce((a, x) => a + (x.download_count || 0), 0), 0);
    const stable  = data.find(r => !r.prerelease);

    stRel.textContent  = data.length || '0';
    stDl.textContent   = fNum(totalDl);
    stLast.textContent = stable ? stable.tag_name : (data[0]?.tag_name || 'N/A');
  }

  /* ── Render ──────────────────────────────────────────── */
  function renderList() {
    const q = searchQ.toLowerCase();
    const filtered = releases.filter(r => {
      const byFilter =
        activeFilter === 'stable' ? !r.prerelease :
        activeFilter === 'beta'   ?  r.prerelease : true;
      const byQ = !q
        || r.tag_name.toLowerCase().includes(q)
        || (r.name  || '').toLowerCase().includes(q)
        || (r.body  || '').toLowerCase().includes(q);
      return byFilter && byQ;
    });

    listEl.innerHTML = '';

    if (!filtered.length) { showEmpty(); return; }
    emptyEl.hidden = true;
    errorEl.hidden = true;

    filtered.forEach((r, i) => listEl.appendChild(buildCard(r, i)));
  }

  /* ── Card ────────────────────────────────────────────── */
  function buildCard(r, idx) {
    const pre   = r.prerelease;
    const tag   = r.tag_name;
    const name  = r.name || tag;
    const dl    = r.assets.reduce((a, x) => a + (x.download_count || 0), 0);
    const mirs  = getTagMirrors(tag);

    const card = mk('div', 'r-card');
    card.style.animationDelay = `${idx * 50}ms`;

    /* head */
    const head = mk('div', 'c-head');
    const row  = mk('div', 'c-title-row');

    // Left
    const left  = mk('div', 'c-left');
    const verRow = mk('div', 'c-ver');
    const verNum = mk('span', 'c-ver-num'); verNum.textContent = tag;
    const tagEl  = mk('span', pre ? 'tag tag-b' : 'tag tag-s');
    tagEl.textContent = pre ? 'Beta' : 'Stable';
    verRow.append(verNum, tagEl);

    const nameEl = mk('p', 'c-name');
    nameEl.textContent = (name !== tag) ? name : `SnapPerf ${tag}`;

    const meta = mk('div', 'c-meta');
    meta.appendChild(metaI(icoDate(), fDate(r.published_at)));
    meta.appendChild(metaI(icoDl(), `${fNum(dl)} downloads`));
    if (r.assets.length) meta.appendChild(metaI(icoPkg(), `${r.assets.length} asset${r.assets.length !== 1 ? 's' : ''}`));

    const upl = mk('div', 'c-uploader');
    upl.innerHTML = `${icoUser()} Uploaded by <strong>${UPLOADER}</strong>`;

    left.append(verRow, nameEl, meta, upl);

    // Right: buttons
    const right = mk('div', 'c-right');

    const clBtn = mk('button', 'btn-ghost');
    clBtn.innerHTML = `${icoDoc()} Changelog`;
    clBtn.addEventListener('click', () => openChangelog(r));

    const mirBtn = mk('button', 'btn-ghost');
    mirBtn.innerHTML = `${icoLink()} Mirrors${mirs.length ? ` (${mirs.length})` : ''}`;
    mirBtn.dataset.tag = tag;
    mirBtn.addEventListener('click', () => openMirror(r, mirBtn));

    right.append(clBtn, mirBtn);
    row.append(left, right);
    head.append(row);

    /* assets */
    const assets = mk('div', 'c-assets');
    if (!r.assets.length) {
      const noA = mk('p', '');
      noA.textContent = 'No downloadable assets for this release.';
      noA.style.cssText = 'font-size:13px;color:var(--t3);padding:4px 0';
      assets.appendChild(noA);
    } else {
      r.assets.forEach(a => assets.appendChild(buildAssetRow(a)));
    }

    /* foot: mirror chips + gh link */
    const foot = mk('div', 'c-foot');
    foot.id = `cfoot_${tag.replace(/\W/g,'_')}`;

    const chips = mk('div', 'c-mirrors');
    buildMirChips(chips, tag);

    const ghA = mk('a', 'btn-ghost');
    ghA.href   = r.html_url;
    ghA.target = '_blank';
    ghA.rel    = 'noopener noreferrer';
    ghA.innerHTML = `${icoGH()} View release`;

    foot.append(chips, ghA);
    card.append(head, assets, foot);
    return card;
  }

  function buildMirChips(container, tag) {
    container.innerHTML = '';
    getTagMirrors(tag).forEach(m => {
      const chip = mk('a', 'mir-chip');
      chip.href = m.url; chip.target = '_blank'; chip.rel = 'noopener noreferrer';
      chip.innerHTML = `${icoLink()} ${m.label}`;
      container.appendChild(chip);
    });
  }

  function refreshFoot(tag) {
    const foot = document.getElementById(`cfoot_${tag.replace(/\W/g,'_')}`);
    if (!foot) return;
    const chips = foot.querySelector('.c-mirrors');
    if (chips) buildMirChips(chips, tag);

    // refresh button label
    const mirBtns = document.querySelectorAll(`[data-tag="${tag}"]`);
    mirBtns.forEach(btn => {
      const count = getTagMirrors(tag).length;
      btn.innerHTML = `${icoLink()} Mirrors${count ? ` (${count})` : ''}`;
    });
  }

  /* ── Asset row ───────────────────────────────────────── */
  function buildAssetRow(a) {
    const row  = mk('div', 'a-row');
    const ico  = mk('div', 'a-ico'); ico.innerHTML = icoZip();
    const info = mk('div', 'a-info');
    const name = mk('div', 'a-name'); name.textContent = a.name;
    const sub  = mk('div', 'a-sub');
    sub.innerHTML = `<span>${fBytes(a.size)}</span><span>${fNum(a.download_count)} dl</span>`;
    info.append(name, sub);
    const btn = mk('a', 'btn-dl');
    btn.href = a.browser_download_url; btn.download = '';
    btn.innerHTML = `${icoDlArr()} Download`;
    row.append(ico, info, btn);
    return row;
  }

  function metaI(ico, text) {
    const el = mk('div', 'c-meta-i');
    el.innerHTML = `${ico}<b>${text}</b>`;
    return el;
  }

  /* ── Changelog modal ─────────────────────────────────── */
  function openChangelog(r) {
    clTag.textContent   = r.tag_name;
    clTitle.textContent = r.name || r.tag_name;
    const body = (r.body || '').trim() || '*No changelog provided for this release.*';
    clBody.innerHTML = typeof marked !== 'undefined'
      ? marked.parse(body)
      : `<pre style="white-space:pre-wrap;font-size:13px;color:var(--t2)">${escH(body)}</pre>`;
    openMod(clOv);
  }
  clClose.addEventListener('click', () => closeMod(clOv));

  /* ── Mirror modal ────────────────────────────────────── */
  function openMirror(r, btn) {
    mirFocusTag = r.tag_name;
    mirTitle.textContent = r.name || r.tag_name;
    mirUrl.value = ''; mirLabel.value = '';
    buildMirList();
    openMod(mirOv);
  }

  function buildMirList() {
    mirList.innerHTML = '';
    const mirs = getTagMirrors(mirFocusTag);
    if (!mirs.length) {
      const e = mk('p', 'mir-empty'); e.textContent = 'No mirrors added yet.';
      mirList.appendChild(e); return;
    }
    mirs.forEach((m, i) => {
      const entry = mk('div', 'mir-entry');
      const info  = mk('div', 'mir-entry-info');
      const lbl   = mk('div', 'mir-el'); lbl.textContent = m.label;
      const url   = mk('div', 'mir-eu'); url.textContent = m.url;
      info.append(lbl, url);
      const del  = mk('button', 'mir-del');
      del.innerHTML = '✕'; del.title = 'Remove';
      del.addEventListener('click', () => {
        delTagMirror(mirFocusTag, i);
        buildMirList();
        refreshFoot(mirFocusTag);
      });
      entry.append(info, del);
      mirList.appendChild(entry);
    });
  }

  mirAdd.addEventListener('click', () => {
    const url   = mirUrl.value.trim();
    const label = mirLabel.value.trim();
    if (!url) { mirUrl.focus(); return; }
    try { new URL(url); } catch {
      mirUrl.style.borderColor = '#ff3b30';
      setTimeout(() => mirUrl.style.borderColor = '', 1200);
      return;
    }
    addTagMirror(mirFocusTag, url, label || url);
    mirUrl.value = ''; mirLabel.value = '';
    buildMirList();
    refreshFoot(mirFocusTag);
  });
  mirClose.addEventListener('click', () => closeMod(mirOv));

  /* ── Modal helpers ───────────────────────────────────── */
  function openMod(ov) {
    ov.hidden = false;
    requestAnimationFrame(() => ov.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function closeMod(ov) {
    ov.classList.remove('open');
    setTimeout(() => { ov.hidden = true; document.body.style.overflow = ''; }, 250);
  }
  // No backdrop click to close — only X button

  /* ── Search ──────────────────────────────────────────── */
  searchIn.addEventListener('input', () => {
    searchQ = searchIn.value;
    searchClr.classList.toggle('on', searchQ.length > 0);
    renderList();
  });
  searchClr.addEventListener('click', () => {
    searchIn.value = ''; searchQ = '';
    searchClr.classList.remove('on');
    searchIn.focus(); renderList();
  });

  /* ── Pills ───────────────────────────────────────────── */
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('pill-active'));
      btn.classList.add('pill-active');
      activeFilter = btn.dataset.filter;
      renderList();
    });
  });

  /* ── Retry ───────────────────────────────────────────── */
  $('retryBtn').addEventListener('click', fetchReleases);

  /* ── No selection / copy ─────────────────────────────── */
  document.addEventListener('selectstart', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
    e.preventDefault();
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('copy', e => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    e.preventDefault();
  });

  /* ── List state helpers ──────────────────────────────── */
  function showSkel() {
    listEl.innerHTML = `
      <div class="skel" style="height:230px"></div>
      <div class="skel" style="height:200px"></div>
      <div class="skel" style="height:215px"></div>`;
    emptyEl.hidden = true; errorEl.hidden = true;
  }
  function showEmpty() { emptyEl.hidden = false; errorEl.hidden = true; }
  function showError(msg) {
    listEl.innerHTML = '';
    errorMsg.textContent = msg || 'Unknown error';
    errorEl.hidden = false; emptyEl.hidden = true;
  }

  /* ── Format ──────────────────────────────────────────── */
  function fNum(n) {
    if (!n) return '0';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'k';
    return String(n);
  }
  function fBytes(b) {
    if (!b) return '—';
    if (b < 1024)    return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(2) + ' MB';
  }
  function fDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  }
  function escH(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function mk(t, c) { const e = document.createElement(t); if (c) e.className = c; return e; }

  /* ── Icons ───────────────────────────────────────────── */
  function icoDate()   { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="2" width="12" height="11" rx="2"/><path d="M1 5h12M5 1v2M9 1v2"/></svg>`; }
  function icoDl()     { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M7 1v8M4 6.5l3 3 3-3M1 11h12"/></svg>`; }
  function icoPkg()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="5" width="12" height="8" rx="1.5"/><path d="M1 8h12M4.5 1l-2 4h9l-2-4"/></svg>`; }
  function icoUser()   { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-3 2.7-5 6-5s6 2 6 5"/></svg>`; }
  function icoDoc()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="1" width="10" height="12" rx="1.5"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3"/></svg>`; }
  function icoLink()   { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5.5 8.5a4 4 0 005.6-5.6L9.5 1.3a4 4 0 00-5.6 5.6M8.5 5.5a4 4 0 00-5.6 5.6l1.6 1.6a4 4 0 005.6-5.6"/></svg>`; }
  function icoGH()     { return `<svg viewBox="0 0 14 14" fill="currentColor"><path d="M7 .175C3.5.175.7 2.95.7 6.4c0 2.75 1.8 5.1 4.3 5.925.3.05.425-.125.425-.275 0-.125-.025-.575-.025-1.075-1.675.35-2.025-.8-2.025-.8-.275-.7-.675-.875-.675-.875-.55-.375.05-.375.05-.375.6.05.925.625.925.625.55.925 1.425.675 1.775.5.05-.4.2-.675.375-.825-1.325-.125-2.725-.65-2.725-2.95 0-.65.225-1.2.625-1.625-.075-.15-.275-.775.075-1.6 0 0 .525-.175 1.7.625.5-.125 1.025-.2 1.55-.2s1.05.075 1.55.2c1.175-.8 1.7-.625 1.7-.625.35.825.15 1.45.075 1.6.4.425.625.975.625 1.625 0 2.3-1.4 2.8-2.75 2.95.225.2.425.575.425 1.175v1.75c0 .15.1.325.425.275 2.5-.825 4.3-3.175 4.3-5.925C13.3 2.95 10.5.175 7 .175z"/></svg>`; }
  function icoZip()    { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="2" y="1" width="10" height="12" rx="1.5"/><path d="M5.5 1v3L7 5l1.5-1V1M7 5v2"/><circle cx="7" cy="9" r="1" fill="currentColor" stroke="none"/></svg>`; }
  function icoDlArr()  { return `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 1v8M4.5 6.5l2.5 3 2.5-3M1 11h12"/></svg>`; }

  /* ── Boot ────────────────────────────────────────────── */
  fetchReleases();

})();
