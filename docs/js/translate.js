/**
 * SnapPerf Real-time Translate System
 * - EN/ID instant switch using built-in LANG strings
 * - Google Translate-like: translates ALL visible text nodes
 * - Caches translated nodes to avoid re-translating
 * - Smooth transition animation
 * - MutationObserver: auto-translates dynamically added content
 */
(function(){
'use strict';

/* ─────────────────── COMPLETE TRANSLATION DICTIONARY ─────────────────── */
var TRANSLATIONS = {
  en: {
    /* NAV */
    'nav.home':'Home', 'nav.updates':'Updates', 'nav.about':'About',
    /* HERO */
    'hero.badge.magisk':'Magisk Module', 'hero.badge.chip':'Snapdragon',
    'hero.desc':'A powerful Magisk performance module engineered for Snapdragon devices. Unlock your device\u2019s true potential \u2014 smoother, faster, smarter.',
    'hero.dl':'Download', 'hero.tg':'Telegram', 'hero.gh':'GitHub',
    /* FEATURES */
    'feat.tag':'Features', 'feat.h2':'Why SnapPerf?',
    'feat.sub':'Engineered for Snapdragon. Built for performance enthusiasts.',
    'feat1.h':'Performance Boost',
    'feat1.p':'Optimized CPU governor and scheduler tweaks for maximum responsiveness on every Snapdragon core cluster.',
    'feat1.b':'Performance',
    'feat2.h':'Battery Saver',
    'feat2.p':'Intelligent power profiles reduce unnecessary drain without sacrificing the user experience.',
    'feat2.b':'Battery',
    'feat3.h':'Display Smoothness',
    'feat3.p':'Fine-tuned frame pacing and Adreno GPU settings for a consistently fluid display experience.',
    'feat3.b':'Display',
    'feat4.h':'Thermal Control',
    'feat4.p':'Manages heat throttling behavior to sustain peak performance during extended gaming sessions.',
    'feat4.b':'Thermal',
    'feat5.h':'Network Boost',
    'feat5.p':'TCP buffer and scheduler optimisations to reduce network latency in online games and apps.',
    'feat5.b':'Network',
    'feat6.h':'Easy Install',
    'feat6.p':'Flash via Magisk or KernelSU Manager. No ADB required. Instant effect after reboot.',
    'feat6.b':'Plug-and-play',
    /* DOWNLOAD */
    'dl.badge':'Stable', 'dl.desc':'The latest stable release for all supported Snapdragon devices.',
    'dl.chip':'Snapdragon Only', 'dl.btn':'Direct Download', 'dl.mirror':'Mirror Link',
    /* COMMUNITY */
    'comm.tag':'Community', 'comm.h2':'Join the Community',
    'comm.sub':'Stay updated, get support, and connect with other SnapPerf users.',
    'comm.lbl':'Official Channel',
    'comm.desc':'Latest releases, updates & announcements',
    /* CHANGELOG */
    'cl.tag':"What\u2019s New", 'cl.all':'View all updates',
    /* ABOUT */
    'about.badge':'About', 'about.h1':'About SnapPerf',
    'about.sub':'The story behind the module and the developer.',
    'about.what.h':'What is SnapPerf?',
    'about.what.p1':'SnapPerf is a Magisk module specifically engineered for Snapdragon-powered Android devices. It applies a curated set of kernel and system-level tweaks to improve overall performance, reduce latency, extend battery life, and enhance display smoothness.',
    'about.what.p2':"Unlike one-size-fits-all tweaks, SnapPerf targets Qualcomm\u2019s unique architecture \u2014 Kryo CPU clusters, Adreno GPU, and Hexagon DSP \u2014 to deliver meaningful, measurable improvements.",
    'about.req.h':'Requirements',
    'about.req.1':'Rooted Android device (Magisk v24+ or KernelSU)',
    'about.req.2':'Qualcomm Snapdragon SoC',
    'about.req.3':'Android 10 or later recommended',
    'about.req.4':'At least 3 GB RAM',
    'about.install.h':'How to Install',
    'about.install.1':'Download the .zip from the releases page.',
    'about.install.2':'Open Magisk Manager or KernelSU Manager.',
    'about.install.3':'Tap \u201cModules\u201d then \u201cInstall from storage\u201d.',
    'about.install.4':'Select the downloaded zip and reboot.',
    'about.disclaimer.h':'Disclaimer',
    'about.disclaimer.p':'SnapPerf is provided as-is. The developer is not responsible for any damage to your device. Always keep a backup before flashing any module. Use at your own risk.',
    /* UPDATES */
    'updates.badge':'Release Updates', 'updates.h1':'Updates & Releases',
    'updates.sub':'Changelogs, release notes, and history updates.',
    'filter.all':'All', 'filter.stable':'Stable', 'filter.fix':'Fix', 'filter.beta':'Beta',
    'search.placeholder':'Search releases\u2026',
    /* FOOTER */
    'footer.copy':'\u00a9 2026 AetherDev'
  },
  id: {
    'nav.home':'Beranda', 'nav.updates':'Pembaruan', 'nav.about':'Tentang',
    'hero.badge.magisk':'Modul Magisk', 'hero.badge.chip':'Snapdragon',
    'hero.desc':'Modul performa Magisk yang powerful, dirancang khusus untuk perangkat Snapdragon. Maksimalkan potensi perangkatmu \u2014 lebih mulus, lebih cepat, lebih pintar.',
    'hero.dl':'Unduh', 'hero.tg':'Telegram', 'hero.gh':'GitHub',
    'feat.tag':'Fitur', 'feat.h2':'Kenapa SnapPerf?',
    'feat.sub':'Dirancang untuk Snapdragon. Dibangun untuk para enthusiast performa.',
    'feat1.h':'Performa Maksimal',
    'feat1.p':'Tweak CPU governor dan scheduler yang dioptimalkan untuk respons maksimal pada setiap kluster inti Snapdragon.',
    'feat1.b':'Performa',
    'feat2.h':'Hemat Baterai',
    'feat2.p':'Profil daya cerdas yang mengurangi konsumsi baterai tanpa mengorbankan pengalaman pengguna.',
    'feat2.b':'Baterai',
    'feat3.h':'Layar Mulus',
    'feat3.p':'Pengaturan frame pacing dan GPU Adreno yang disempurnakan untuk pengalaman layar yang konsisten dan mulus.',
    'feat3.b':'Layar',
    'feat4.h':'Kontrol Termal',
    'feat4.p':'Mengelola perilaku throttling panas untuk mempertahankan performa puncak selama sesi gaming yang panjang.',
    'feat4.b':'Termal',
    'feat5.h':'Boost Jaringan',
    'feat5.p':'Optimasi TCP buffer dan scheduler untuk mengurangi latensi jaringan dalam game online dan aplikasi.',
    'feat5.b':'Jaringan',
    'feat6.h':'Mudah Dipasang',
    'feat6.p':'Flash via Magisk atau KernelSU Manager. Tanpa ADB. Langsung efektif setelah reboot.',
    'feat6.b':'Plug-and-play',
    'dl.badge':'Stabil', 'dl.desc':'Rilis stabil terbaru untuk semua perangkat Snapdragon yang didukung.',
    'dl.chip':'Khusus Snapdragon', 'dl.btn':'Unduh Langsung', 'dl.mirror':'Link Mirror',
    'comm.tag':'Komunitas', 'comm.h2':'Bergabung dengan Komunitas',
    'comm.sub':'Tetap update, dapatkan dukungan, dan terhubung dengan pengguna SnapPerf lainnya.',
    'comm.lbl':'Saluran Resmi',
    'comm.desc':'Rilis terbaru, pembaruan & pengumuman',
    'cl.tag':'Yang Baru', 'cl.all':'Lihat semua pembaruan',
    'about.badge':'Tentang', 'about.h1':'Tentang SnapPerf',
    'about.sub':'Kisah di balik modul dan developernya.',
    'about.what.h':'Apa itu SnapPerf?',
    'about.what.p1':'SnapPerf adalah modul Magisk yang dirancang khusus untuk perangkat Android bertenaga Snapdragon. Modul ini menerapkan serangkaian tweak kernel dan sistem untuk meningkatkan performa, mengurangi latensi, memperpanjang masa baterai, dan meningkatkan kelancaran layar.',
    'about.what.p2':'Berbeda dari tweak umum, SnapPerf menargetkan arsitektur unik Qualcomm \u2014 kluster CPU Kryo, GPU Adreno, dan DSP Hexagon \u2014 untuk memberikan peningkatan yang nyata dan terukur.',
    'about.req.h':'Persyaratan',
    'about.req.1':'Perangkat Android yang di-root (Magisk v24+ atau KernelSU)',
    'about.req.2':'SoC Qualcomm Snapdragon',
    'about.req.3':'Android 10 atau lebih baru direkomendasikan',
    'about.req.4':'Minimal 3 GB RAM',
    'about.install.h':'Cara Install',
    'about.install.1':'Unduh file .zip dari halaman rilis.',
    'about.install.2':'Buka Magisk Manager atau KernelSU Manager.',
    'about.install.3':'Ketuk \u201cModul\u201d lalu \u201cInstal dari penyimpanan\u201d.',
    'about.install.4':'Pilih zip yang diunduh dan reboot.',
    'about.disclaimer.h':'Disclaimer',
    'about.disclaimer.p':'SnapPerf disediakan apa adanya. Developer tidak bertanggung jawab atas kerusakan perangkat. Selalu buat backup sebelum memasang modul. Gunakan dengan risiko sendiri.',
    'updates.badge':'Rilis Terbaru', 'updates.h1':'Pembaruan & Rilis',
    'updates.sub':'Changelog, catatan rilis, dan histori pembaruan.',
    'filter.all':'Semua', 'filter.stable':'Stabil', 'filter.fix':'Perbaikan', 'filter.beta':'Beta',
    'search.placeholder':'Cari rilis\u2026',
    'footer.copy':'\u00a9 2026 AetherDev'
  }
};

/* ─────────────────── CORE LANG ENGINE ─────────────────── */
function getLang(){ return localStorage.getItem('sp-lang') || 'id'; }
function setLang(l){ localStorage.setItem('sp-lang', l); }
function tr(key){
  var l = getLang();
  return (TRANSLATIONS[l] && TRANSLATIONS[l][key] != null)
    ? TRANSLATIONS[l][key]
    : (TRANSLATIONS.en[key] || key);
}

/* ─────────────────── APPLY i18n ATTRIBUTES ─────────────────── */
function applyI18n(root){
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach(function(el){
    var v = tr(el.getAttribute('data-i18n'));
    if(v != null) el.textContent = v;
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
    var v = tr(el.getAttribute('data-i18n-placeholder'));
    if(v) el.placeholder = v;
  });
  root.querySelectorAll('[data-i18n-title]').forEach(function(el){
    var v = tr(el.getAttribute('data-i18n-title'));
    if(v) el.title = v;
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(function(el){
    var v = tr(el.getAttribute('data-i18n-aria'));
    if(v) el.setAttribute('aria-label', v);
  });
}

/* ─────────────────── LANG LABEL UPDATE ─────────────────── */
function updateLangUI(lang){
  var lbl = document.getElementById('langLabel');
  if(lbl) lbl.textContent = lang === 'id' ? 'ID' : 'EN';

  document.querySelectorAll('.mob-lang-label, #mobLangLabel').forEach(function(m){
    m.textContent = lang === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia';
  });

  document.documentElement.lang = lang === 'id' ? 'id' : 'en';

  // Update the lang toggle button tooltip
  document.querySelectorAll('[data-lang-toggle-label]').forEach(function(el){
    el.textContent = lang === 'id' ? 'EN' : 'ID';
  });
}

/* ─────────────────── REALTIME TRANSLATE ENGINE ─────────────────── */
/*
  Strategy: Like Google Translate, walk every visible text node in the DOM,
  store the original text (data-orig), apply translation.
  Uses a built-in phrase map for common UI strings + pattern matching.
  For dynamic content (releases cards, changelog), auto-retranslates on DOM change.
*/

// Phrase maps per language (what EN text maps to ID text and vice versa)
var PHRASE_MAP_EN_TO_ID = {
  // Badges & labels
  'Stable':'Stabil', 'Beta':'Beta', 'Fix':'Perbaikan', 'Hotfix':'Perbaikan Cepat',
  'Download':'Unduh', 'Mirror Link':'Link Mirror', 'Direct Download':'Unduh Langsung',
  'View all updates':'Lihat semua pembaruan',
  'What\'s New':'Yang Baru',
  'Loading\u2026':'Memuat\u2026', 'Loading...':'Memuat...',
  // Dates & meta  
  'ago':'lalu', 'just now':'baru saja',
  // Buttons
  'Report via Telegram':'Lapor via Telegram',
  'View on GitHub':'Lihat di GitHub',
  'All':'Semua', 'Search releases\u2026':'Cari rilis\u2026',
  // Release card labels
  'Downloads':'Unduhan', 'Size':'Ukuran', 'Published':'Diterbitkan',
  'assets':'aset',
  // Error messages
  'Failed to load':'Gagal memuat',
  'Rate limit reached':'Batas request tercapai',
  'Try refreshing':'Coba refresh',
  'View on GitHub \u2197':'Lihat di GitHub \u2197',
  'See all releases':'Lihat semua rilis',
  'Bug Reports & Known Issues':'Laporan Bug & Masalah Diketahui',
  'Found a bug? Report it on Telegram. Include your device model, Snapdragon variant, Android version, and a logcat if possible.':'Menemukan bug? Laporkan di Telegram. Sertakan model perangkat, varian Snapdragon, versi Android, dan logcat jika memungkinkan.',
  // Common UI
  'Home':'Beranda', 'Updates':'Pembaruan', 'About':'Tentang',
  'Features':'Fitur', 'Community':'Komunitas',
  'Join the Community':'Bergabung dengan Komunitas',
  'Official Channel':'Saluran Resmi',
  'Latest releases, updates & announcements':'Rilis terbaru, pembaruan & pengumuman',
  'Snapdragon Only':'Khusus Snapdragon',
  'The latest stable release for all supported Snapdragon devices.':'Rilis stabil terbaru untuk semua perangkat Snapdragon yang didukung.',
  '\u00a9 2026 AetherDev':'\u00a9 2026 AetherDev',
};

var PHRASE_MAP_ID_TO_EN = {};
Object.keys(PHRASE_MAP_EN_TO_ID).forEach(function(k){
  var v = PHRASE_MAP_EN_TO_ID[k];
  if(v !== k) PHRASE_MAP_ID_TO_EN[v] = k;
});

// Nodes to SKIP during translation (code, scripts, inputs, etc.)
var SKIP_TAGS = {SCRIPT:1,STYLE:1,NOSCRIPT:1,CODE:1,PRE:1,INPUT:1,TEXTAREA:1,SELECT:1,CANVAS:1,SVG:1,MATH:1};
var SKIP_CLASSES = ['sp-toast','adm-','lock-','sp-nd-'];

function shouldSkipEl(el){
  if(!el) return true;
  if(el.nodeType === 1){
    if(SKIP_TAGS[el.tagName]) return true;
    var cls = el.className || '';
    for(var i = 0; i < SKIP_CLASSES.length; i++){
      if(typeof cls === 'string' && cls.indexOf(SKIP_CLASSES[i]) !== -1) return true;
    }
  }
  return false;
}

// Store original texts on elements
var ORIG_ATTR = 'data-tr-orig';
var ORIG_LANG_ATTR = 'data-tr-orig-lang';

function walkTextNodes(root, callback){
  var walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node){
        var p = node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(shouldSkipEl(p)) return NodeFilter.FILTER_REJECT;
        // Skip if parent has data-i18n (handled by applyI18n)
        if(p.getAttribute('data-i18n')) return NodeFilter.FILTER_REJECT;
        // Only accept if there's actual non-whitespace text
        var txt = node.textContent.trim();
        if(!txt || txt.length < 2) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  var node;
  while(node = walker.nextNode()){
    callback(node);
  }
}

function translateNode(node, toLang){
  var el = node.parentElement;
  if(!el) return;

  var origText = el.getAttribute(ORIG_ATTR);
  var origLang = el.getAttribute(ORIG_LANG_ATTR);

  // First time: store original
  if(!origText){
    origText = node.textContent;
    origLang = 'en'; // assume page default is English
    el.setAttribute(ORIG_ATTR, origText);
    el.setAttribute(ORIG_LANG_ATTR, origLang);
  }

  // Determine source and target
  var srcText = origText.trim();
  if(!srcText || srcText.length < 2) return;

  var translated = null;

  if(toLang === 'id'){
    // EN -> ID
    translated = PHRASE_MAP_EN_TO_ID[srcText] || null;
    // Try partial matching for longer sentences
    if(!translated){
      var lower = srcText.toLowerCase();
      for(var key in PHRASE_MAP_EN_TO_ID){
        if(lower === key.toLowerCase()){
          translated = PHRASE_MAP_EN_TO_ID[key];
          break;
        }
      }
    }
  } else {
    // ID -> EN: restore original
    translated = origText;
  }

  if(translated && translated !== node.textContent){
    node.textContent = origText.slice(0, origText.indexOf(srcText)) + translated + origText.slice(origText.indexOf(srcText) + srcText.length);
  } else if(toLang === 'en'){
    // Restore original
    node.textContent = origText;
  }
}

function translateAllNodes(root, toLang){
  walkTextNodes(root || document.body, function(node){
    translateNode(node, toLang);
  });
}

/* ─────────────────── SMOOTH TRANSITION ─────────────────── */
function applyTransition(callback){
  // Fade out, translate, fade in — like Google Translate
  document.body.style.transition = 'opacity 0.12s ease';
  document.body.style.opacity = '0.7';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      callback();
      document.body.style.opacity = '1';
      setTimeout(function(){
        document.body.style.transition = '';
      }, 150);
    });
  });
}

/* ─────────────────── MUTATION OBSERVER for dynamic content ─────────────────── */
var _observer = null;
var _observerPending = false;

function startObserver(){
  if(_observer) return;
  _observer = new MutationObserver(function(mutations){
    if(_observerPending) return;
    _observerPending = true;
    requestAnimationFrame(function(){
      _observerPending = false;
      var lang = getLang();
      if(lang === 'id'){
        mutations.forEach(function(m){
          m.addedNodes.forEach(function(node){
            if(node.nodeType === 1 && !shouldSkipEl(node)){
              // Apply i18n attributes first
              applyI18n(node);
              // Then translate text nodes
              translateAllNodes(node, 'id');
            }
          });
        });
      }
    });
  });
  _observer.observe(document.body, {childList: true, subtree: true});
}

/* ─────────────────── MAIN TOGGLE ─────────────────── */
function toggleLanguage(){
  var current = getLang();
  var next = current === 'id' ? 'en' : 'id';

  applyTransition(function(){
    setLang(next);
    // 1. Apply all data-i18n attributes
    applyI18n(document);
    // 2. Translate all other text nodes
    translateAllNodes(document.body, next);
    // 3. Update UI labels
    updateLangUI(next);
    // 4. Update search placeholder
    var searchInput = document.getElementById('postSearch');
    if(searchInput) searchInput.placeholder = tr('search.placeholder');
    // 5. Fire custom event for any listeners
    document.dispatchEvent(new CustomEvent('sp:langchange', {detail:{lang:next}}));
  });
}

/* ─────────────────── INIT ─────────────────── */
function init(){
  var lang = getLang();

  // Apply translations immediately
  applyI18n(document);
  updateLangUI(lang);

  // For ID: also translate non-tagged text
  if(lang === 'id'){
    translateAllNodes(document.body, 'id');
  }

  // Wire up ALL lang toggle buttons
  function wireLangBtn(el){
    if(!el || el._spLangBound) return;
    el._spLangBound = true;
    el.addEventListener('click', toggleLanguage);
  }

  document.querySelectorAll(
    '#langToggle, .mob-lang-btn, .mob-lang-row, #mobLangBtn, [data-lang-toggle]'
  ).forEach(wireLangBtn);

  // Watch for dynamically added toggle buttons
  new MutationObserver(function(){
    document.querySelectorAll('#langToggle, .mob-lang-btn, .mob-lang-row, #mobLangBtn, [data-lang-toggle]').forEach(wireLangBtn);
  }).observe(document.body, {childList:true, subtree:true});

  // Start dynamic content observer
  startObserver();

  // Expose globally for main.js compatibility
  window.SP_TRANSLATE = {
    toggle: toggleLanguage,
    apply: applyI18n,
    getLang: getLang,
    tr: tr,
    translateNodes: translateAllNodes
  };

  // Override window.applyLang for backward compat
  window.applyLang = function(){
    applyI18n(document);
    updateLangUI(getLang());
  };
}

// Run after DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
