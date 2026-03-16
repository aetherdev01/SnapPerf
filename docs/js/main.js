'use strict';
// ============================================================
// SNAPPERF – main.js
// Complete bilingual system: ID/EN with full-page real-time
// translation powered by MyMemory API + smart local cache
// ============================================================

var LANG={en:{'nav.home':'Home','nav.updates':'Updates','nav.about':'About','hero.badge.magisk':'Magisk Module','hero.badge.chip':'Snapdragon','hero.desc':"A powerful Magisk performance module engineered for Snapdragon devices. Unlock your device\u2019s true potential \u2014 smoother, faster, smarter.",'hero.dl':'Download','hero.tg':'Telegram','hero.gh':'GitHub','feat.tag':'Features','feat.h2':'Why SnapPerf?','feat.sub':'Engineered for Snapdragon. Built for performance enthusiasts.','feat1.h':'Performance Boost','feat1.p':'Optimized CPU governor and scheduler tweaks for maximum responsiveness on every Snapdragon core cluster.','feat1.b':'Performance','feat2.h':'Battery Saver','feat2.p':'Intelligent power profiles reduce unnecessary drain without sacrificing the user experience.','feat2.b':'Battery','feat3.h':'Display Smoothness','feat3.p':'Fine-tuned frame pacing and Adreno GPU settings for a consistently fluid display experience.','feat3.b':'Display','feat4.h':'Thermal Control','feat4.p':'Manages heat throttling behavior to sustain peak performance during extended gaming sessions.','feat4.b':'Thermal','feat5.h':'Network Boost','feat5.p':'TCP buffer and scheduler optimisations to reduce network latency in online games and apps.','feat5.b':'Network','feat6.h':'Easy Install','feat6.p':'Flash via Magisk or KernelSU Manager. No ADB required. Instant effect after reboot.','feat6.b':'Plug-and-play','dl.badge':'Stable','dl.desc':'The latest stable release for all supported Snapdragon devices.','dl.chip':'Snapdragon Only','dl.btn':'Direct Download','dl.mirror':'Mirror Link','comm.tag':'Community','comm.h2':'Join the Community','comm.sub':'Stay updated, get support, and connect with other SnapPerf users.','comm.lbl':'Official Channel','comm.desc':'Latest releases, updates & announcements','cl.tag':"What\u2019s New",'cl.all':'View all updates','about.badge':'About','about.h1':'About SnapPerf','about.sub':'The story behind the module and the developer.','about.what.h':'What is SnapPerf?','about.what.p1':'SnapPerf is a Magisk module specifically engineered for Snapdragon-powered Android devices. It applies a curated set of kernel and system-level tweaks to improve overall performance, reduce latency, extend battery life, and enhance display smoothness.','about.what.p2':"Unlike one-size-fits-all tweaks, SnapPerf targets Qualcomm\u2019s unique architecture \u2014 Kryo CPU clusters, Adreno GPU, and Hexagon DSP \u2014 to deliver meaningful, measurable improvements.",'about.req.h':'Requirements','about.req.1':'Rooted Android device (Magisk v24+ or KernelSU)','about.req.2':'Qualcomm Snapdragon SoC','about.req.3':'Android 10 or later recommended','about.req.4':'At least 3 GB RAM','about.install.h':'How to Install','about.install.1':'Download the .zip from the releases page.','about.install.2':'Open Magisk Manager or KernelSU Manager.','about.install.3':'Tap \u201cModules\u201d then \u201cInstall from storage\u201d.','about.install.4':'Select the downloaded zip and reboot.','about.disclaimer.h':'Disclaimer','about.disclaimer.p':'SnapPerf is provided as-is. The developer is not responsible for any damage to your device. Always keep a backup before flashing any module. Use at your own risk.','updates.badge':'Release Updates','updates.h1':'Updates & Releases','updates.sub':'Changelogs, release notes, and history updates.','filter.all':'All','filter.stable':'Stable','filter.fix':'Fix','filter.beta':'Beta','search.placeholder':'Search releases\u2026','footer.copy':'\u00a9 2026 AetherDev'},id:{'nav.home':'Beranda','nav.updates':'Pembaruan','nav.about':'Tentang','hero.badge.magisk':'Modul Magisk','hero.badge.chip':'Snapdragon','hero.desc':"Modul performa Magisk yang powerful, dirancang khusus untuk perangkat Snapdragon. Maksimalkan potensi perangkatmu \u2014 lebih mulus, lebih cepat, lebih pintar.",'hero.dl':'Unduh','hero.tg':'Telegram','hero.gh':'GitHub','feat.tag':'Fitur','feat.h2':'Kenapa SnapPerf?','feat.sub':'Dirancang untuk Snapdragon. Dibangun untuk para enthusiast performa.','feat1.h':'Performa Maksimal','feat1.p':'Tweak CPU governor dan scheduler yang dioptimalkan untuk respons maksimal pada setiap kluster inti Snapdragon.','feat1.b':'Performa','feat2.h':'Hemat Baterai','feat2.p':'Profil daya cerdas yang mengurangi konsumsi baterai tanpa mengorbankan pengalaman pengguna.','feat2.b':'Baterai','feat3.h':'Layar Mulus','feat3.p':'Pengaturan frame pacing dan GPU Adreno yang disempurnakan untuk pengalaman layar yang konsisten dan mulus.','feat3.b':'Layar','feat4.h':'Kontrol Termal','feat4.p':'Mengelola perilaku throttling panas untuk mempertahankan performa puncak selama sesi gaming yang panjang.','feat4.b':'Termal','feat5.h':'Boost Jaringan','feat5.p':'Optimasi TCP buffer dan scheduler untuk mengurangi latensi jaringan dalam game online dan aplikasi.','feat5.b':'Jaringan','feat6.h':'Mudah Dipasang','feat6.p':'Flash via Magisk atau KernelSU Manager. Tanpa ADB. Langsung efektif setelah reboot.','feat6.b':'Plug-and-play','dl.badge':'Stabil','dl.desc':'Rilis stabil terbaru untuk semua perangkat Snapdragon yang didukung.','dl.chip':'Khusus Snapdragon','dl.btn':'Unduh Langsung','dl.mirror':'Link Mirror','comm.tag':'Komunitas','comm.h2':'Bergabung dengan Komunitas','comm.sub':'Tetap update, dapatkan dukungan, dan terhubung dengan pengguna SnapPerf lainnya.','comm.lbl':'Saluran Resmi','comm.desc':'Rilis terbaru, pembaruan & pengumuman','cl.tag':'Yang Baru','cl.all':'Lihat semua pembaruan','about.badge':'Tentang','about.h1':'Tentang SnapPerf','about.sub':'Kisah di balik modul dan developernya.','about.what.h':'Apa itu SnapPerf?','about.what.p1':'SnapPerf adalah modul Magisk yang dirancang khusus untuk perangkat Android bertenaga Snapdragon. Modul ini menerapkan serangkaian tweak kernel dan sistem untuk meningkatkan performa, mengurangi latensi, memperpanjang masa baterai, dan meningkatkan kelancaran layar.','about.what.p2':"Berbeda dari tweak umum, SnapPerf menargetkan arsitektur unik Qualcomm \u2014 kluster CPU Kryo, GPU Adreno, dan DSP Hexagon \u2014 untuk memberikan peningkatan yang nyata dan terukur.",'about.req.h':'Persyaratan','about.req.1':'Perangkat Android yang di-root (Magisk v24+ atau KernelSU)','about.req.2':'SoC Qualcomm Snapdragon','about.req.3':'Android 10 atau lebih baru direkomendasikan','about.req.4':'Minimal 3 GB RAM','about.install.h':'Cara Install','about.install.1':'Unduh file .zip dari halaman rilis.','about.install.2':'Buka Magisk Manager atau KernelSU Manager.','about.install.3':'Ketuk \u201cModul\u201d lalu \u201cInstal dari penyimpanan\u201d.','about.install.4':'Pilih zip yang diunduh dan reboot.','about.disclaimer.h':'Disclaimer','about.disclaimer.p':'SnapPerf disediakan apa adanya. Developer tidak bertanggung jawab atas kerusakan perangkat. Selalu buat backup sebelum memasang modul. Gunakan dengan risiko sendiri.','updates.badge':'Rilis Terbaru','updates.h1':'Pembaruan & Rilis','updates.sub':'Changelog, catatan rilis, dan histori pembaruan.','filter.all':'Semua','filter.stable':'Stabil','filter.fix':'Perbaikan','filter.beta':'Beta','search.placeholder':'Cari rilis\u2026','footer.copy':'\u00a9 2026 AetherDev'}};

function getCurLang(){return localStorage.getItem('sp-lang')||'id';}
function t(key){var l=getCurLang();return(LANG[l]&&LANG[l][key]!=null)?LANG[l][key]:(LANG.en[key]||key);}

function applyLang(){
  var lang=getCurLang();
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var v=t(el.getAttribute('data-i18n'));
    if(v!=null)el.textContent=v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
    var v=t(el.getAttribute('data-i18n-placeholder'));
    if(v)el.placeholder=v;
  });
  var lbl=document.getElementById('langLabel');
  if(lbl)lbl.textContent=lang==='id'?'ID':'EN';
  document.querySelectorAll('.mob-lang-label').forEach(function(m){
    m.textContent=lang==='id'?'Switch to English':'Beralih ke Bahasa Indonesia';
  });
  document.documentElement.lang=lang==='id'?'id':'en';
}

function escHTML(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
window.escHTML=escHTML;

// ============================================================
// REAL-TIME FULL-PAGE TRANSLATE ENGINE
// Works like Google Translate: translates ALL visible text nodes
// Uses: built-in LANG dict → MyMemory API fallback → cache
// ============================================================
(function(){
  var TRANS_CACHE_KEY='sp-trans-cache';
  var TRANS_LANG_KEY='sp-trans-active';
  var _transCache={};
  var _pendingQueue=[];
  var _batchTimer=null;
  var _isTranslating=false;
  var _observer=null;

  // Load cache from localStorage
  try{var c=localStorage.getItem(TRANS_CACHE_KEY);if(c)_transCache=JSON.parse(c);}catch(e){}

  function saveCacheToLS(){
    try{
      var keys=Object.keys(_transCache);
      // Keep only last 500 entries to avoid localStorage quota
      if(keys.length>500){
        var trimmed={};
        keys.slice(-500).forEach(function(k){trimmed[k]=_transCache[k];});
        _transCache=trimmed;
      }
      localStorage.setItem(TRANS_CACHE_KEY,JSON.stringify(_transCache));
    }catch(e){}
  }

  function cacheKey(text,from,to){
    return from+'|'+to+'|'+text.trim().toLowerCase().slice(0,100);
  }

  // Translate a batch of texts via MyMemory API
  async function apiTranslateBatch(texts,from,to){
    var results={};
    // MyMemory supports up to 500 chars per request; batch wisely
    for(var i=0;i<texts.length;i++){
      var text=texts[i];
      if(!text||!text.trim()||text.trim().length<2){results[text]=text;continue;}
      var ck=cacheKey(text,from,to);
      if(_transCache[ck]){results[text]=_transCache[ck];continue;}
      try{
        var url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text.slice(0,500))+'&langpair='+from+'|'+to+'&de=snapperf@gmail.com';
        var res=await fetch(url,{signal:AbortSignal.timeout?AbortSignal.timeout(5000):undefined});
        if(!res.ok)throw new Error('HTTP '+res.status);
        var data=await res.json();
        var translated=(data.responseData&&data.responseData.translatedText)||text;
        // MyMemory sometimes returns HTML entities or same text on failure
        if(translated&&translated!==text&&data.responseStatus===200){
          _transCache[ck]=translated;
          results[text]=translated;
        }else{
          results[text]=text; // keep original if API fails/same
        }
      }catch(e){
        results[text]=text;
      }
    }
    saveCacheToLS();
    return results;
  }

  // Skip elements: scripts, styles, nav buttons, badges, code, inputs
  var SKIP_TAGS=new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','CANVAS','SVG','IMG','INPUT','TEXTAREA','SELECT','BUTTON','CODE','PRE']);
  // Skip elements with these classes (UI controls, version numbers etc)
  var SKIP_CLASSES=['badge','btn','nav-link','mob-link','lang-btn','theme-toggle','hamburger','footer-copy-txt','version','tag','cl-dot','feat-badge','comm-feat-handle','comm-small-sub','adm-','sp-toast'];

  function shouldSkip(node){
    if(node.nodeType===Node.ELEMENT_NODE){
      if(SKIP_TAGS.has(node.tagName))return true;
      if(node.hasAttribute('data-notranslate'))return true;
      if(node.hasAttribute('data-i18n'))return true; // handled by LANG dict
      var cls=node.className||'';
      if(typeof cls==='string'){
        for(var i=0;i<SKIP_CLASSES.length;i++){
          if(cls.indexOf(SKIP_CLASSES[i])!==-1)return true;
        }
      }
      // Skip very short text elements or pure symbols
      return false;
    }
    return false;
  }

  // Collect all translatable text nodes on the page
  function collectTextNodes(root){
    var nodes=[];
    var walker=document.createTreeWalker(
      root||document.body,
      NodeFilter.SHOW_TEXT,
      {acceptNode:function(node){
        var parent=node.parentNode;
        if(!parent)return NodeFilter.FILTER_REJECT;
        if(shouldSkip(parent))return NodeFilter.FILTER_REJECT;
        // Skip text that is: empty, only whitespace, only numbers, only symbols
        var text=node.textContent.trim();
        if(!text||text.length<3)return NodeFilter.FILTER_REJECT;
        if(/^[\d\s\.,\-\/\(\)@#%:;!?+_=<>|\*&]+$/.test(text))return NodeFilter.FILTER_REJECT;
        // Skip version-like strings
        if(/^v\d/.test(text)||/^\d+\.\d+/.test(text))return NodeFilter.FILTER_REJECT;
        // Must have at least one alphabetical character
        if(!/[a-zA-Z\u00C0-\u017E\u0100-\u024F]/.test(text))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }}
    );
    var node;
    while((node=walker.nextNode()))nodes.push(node);
    return nodes;
  }

  // Store original texts for reverting
  var _originals=new WeakMap();

  // Apply translations to text nodes
  async function translatePage(toLang,fromLang){
    if(_isTranslating)return;
    _isTranslating=true;
    // Store originals if not done yet
    var nodes=collectTextNodes();
    // Collect unique texts
    var texts=[];
    var textSet={};
    nodes.forEach(function(node){
      var text=node.textContent.trim();
      if(text&&!textSet[text]){textSet[text]=true;texts.push(text);}
      // Store original
      if(!_originals.has(node))_originals.set(node,node.textContent);
    });
    if(!texts.length){_isTranslating=false;return;}

    // Show translate indicator
    showTranslateBar(true,toLang);

    // Batch translate (20 at a time to avoid rate limits)
    var BATCH=20;
    for(var i=0;i<texts.length;i+=BATCH){
      var batch=texts.slice(i,i+BATCH);
      var translated=await apiTranslateBatch(batch,fromLang,toLang);
      // Apply translations to DOM nodes
      nodes.forEach(function(node){
        var orig=(_originals.get(node)||'').trim();
        if(translated[orig]&&translated[orig]!==orig){
          // Preserve surrounding whitespace
          var ws=node.textContent.match(/^(\s*)(.*?)(\s*)$/);
          node.textContent=(ws?ws[1]:'')+translated[orig]+(ws?ws[3]:'');
        }
      });
    }

    showTranslateBar(false,toLang);
    _isTranslating=false;
    localStorage.setItem(TRANS_LANG_KEY,toLang);
  }

  // Revert to original language (ID) — restore all original text nodes
  function revertToOriginal(){
    var nodes=collectTextNodes();
    nodes.forEach(function(node){
      if(_originals.has(node)){
        node.textContent=_originals.get(node);
      }
    });
    // Re-apply the LANG dict for data-i18n elements
    applyLang();
    localStorage.removeItem(TRANS_LANG_KEY);
  }

  // Translate indicator bar
  function showTranslateBar(loading,lang){
    var bar=document.getElementById('sp-translate-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.id='sp-translate-bar';
      bar.style.cssText='position:fixed;bottom:1rem;right:1rem;z-index:9998;background:var(--glass2,rgba(255,255,255,.9));backdrop-filter:blur(20px);border:1px solid var(--glass-border2,rgba(255,255,255,.8));border-radius:2rem;padding:.45rem 1rem;font-family:inherit;font-size:.75rem;font-weight:700;color:var(--text2,#3d4263);display:flex;align-items:center;gap:.4rem;box-shadow:0 4px 20px rgba(0,0,0,.12);transition:opacity .3s,transform .3s;pointer-events:none;';
      document.body.appendChild(bar);
    }
    if(loading){
      bar.innerHTML='<span style="display:inline-block;width:13px;height:13px;border:2px solid var(--glass-border2);border-top-color:var(--accent,#1a6bff);border-radius:50%;animation:spin .6s linear infinite"></span> Menerjemahkan...';
      bar.style.opacity='1';bar.style.transform='translateY(0)';
    }else{
      bar.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="var(--accent,#1a6bff)" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="var(--accent,#1a6bff)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Halaman diterjemahkan ke '+(lang==='en'?'English':'Bahasa Indonesia');
      bar.style.opacity='1';bar.style.transform='translateY(0)';
      setTimeout(function(){bar.style.opacity='0';bar.style.transform='translateY(8px)';setTimeout(function(){bar.remove();},350);},3000);
    }
  }

  // Main language toggle: decides whether to use LANG dict or full translate API
  window.toggleLangFull=function(){
    var cur=getCurLang();
    var next=cur==='id'?'en':'id';
    localStorage.setItem('sp-lang',next);
    applyLang(); // instant dict-based update

    // Full-page translate for texts NOT covered by data-i18n
    if(next==='en'){
      // Translate from ID to EN
      translatePage('en','id');
    }else{
      // Revert to original ID texts + apply dict
      revertToOriginal();
    }

    // Animate
    document.body.style.transition='opacity .15s ease';
    document.body.style.opacity='0.7';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        document.body.style.opacity='1';
        setTimeout(function(){document.body.style.transition='';document.body.style.opacity='';},160);
      });
    });
  };

  // On page load: restore previously selected language
  window.addEventListener('DOMContentLoaded',function(){
    var savedLang=getCurLang();
    if(savedLang==='en'){
      // Re-translate after small delay so content is loaded
      setTimeout(function(){translatePage('en','id');},300);
    }
  });

  // Expose for manual calls
  window._translatePage=translatePage;
  window._revertTranslate=revertToOriginal;
})();

// ============================================================
// BOOT: theme, lang, clean URL
// ============================================================
(function(){
  var th=localStorage.getItem('sp-theme')||'light';
  document.documentElement.setAttribute('data-theme',th);
  if(!localStorage.getItem('sp-lang'))localStorage.setItem('sp-lang','id');
  if(window.location.pathname.endsWith('.html')){
    var clean=window.location.pathname.replace(/\.html$/,'');
    window.history.replaceState(null,'',clean+window.location.search+window.location.hash);
  }
})();

document.addEventListener('DOMContentLoaded',function(){
  requestAnimationFrame(function(){document.body.classList.remove('page-transitioning');});
  applyLang();

  var isLow=document.documentElement.classList.contains('perf-low');

  var bar=document.createElement('div');bar.className='scroll-progress';document.documentElement.appendChild(bar);
  var rafP=false;
  function updateBar(){if(rafP)return;rafP=true;requestAnimationFrame(function(){var top=window.pageYOffset||0;var total=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-window.innerHeight;bar.style.width=(total>0?Math.min(100,(top/total)*100):0)+'%';rafP=false;});}
  window.addEventListener('scroll',updateBar,{passive:true});
  window.addEventListener('resize',updateBar,{passive:true});
  setTimeout(updateBar,150);

  var themeBtn=document.getElementById('themeToggle');
  if(themeBtn)themeBtn.addEventListener('click',function(){
    var root=document.documentElement;var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    themeBtn.classList.add('theme-spin');themeBtn.addEventListener('animationend',function(){themeBtn.classList.remove('theme-spin');},{once:true});
    root.classList.add('theme-transitioning');root.setAttribute('data-theme',next);localStorage.setItem('sp-theme',next);
    if(!isLow){var flash=document.createElement('div');flash.className='theme-flash';document.body.appendChild(flash);flash.addEventListener('animationend',function(){flash.remove();root.classList.remove('theme-transitioning');});}
    else{root.classList.remove('theme-transitioning');}
  });

  // Language toggle — use the new full-page translate engine
  function toggleLang(){
    if(window.toggleLangFull){window.toggleLangFull();}
    else{
      var next=getCurLang()==='en'?'id':'en';
      localStorage.setItem('sp-lang',next);applyLang();
    }
  }
  var langBtn=document.getElementById('langToggle');
  if(langBtn)langBtn.addEventListener('click',toggleLang);
  document.querySelectorAll('.mob-lang-btn,.mob-lang-row').forEach(function(btn){
    btn.addEventListener('click',function(){
      toggleLang();
      var ham=document.getElementById('hamburger');var mobMenu=document.getElementById('mobileMenu');
      if(ham)ham.classList.remove('open');if(mobMenu)mobMenu.classList.remove('open');
    });
  });

  var ham=document.getElementById('hamburger');var mobMenu=document.getElementById('mobileMenu');
  if(ham&&mobMenu){
    ham.addEventListener('click',function(e){e.stopPropagation();ham.classList.toggle('open');mobMenu.classList.toggle('open');});
    document.addEventListener('click',function(e){if(!ham.contains(e.target)&&!mobMenu.contains(e.target)){ham.classList.remove('open');mobMenu.classList.remove('open');}});
  }

  if(!isLow){
    document.addEventListener('click',function(e){
      var b=e.target.closest('.ripple-btn');if(!b)return;
      var ex=b.querySelector('.ripple');if(ex)ex.remove();
      var r=b.getBoundingClientRect();var s=Math.max(r.width,r.height)*2.2;
      var rp=document.createElement('span');rp.className='ripple';rp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px;';
      b.appendChild(rp);rp.addEventListener('animationend',function(){rp.remove();});
    });
    document.addEventListener('mousedown',function(e){
      var b=e.target.closest('.btn,.filter-btn,.lang-btn,.theme-toggle,.hamburger,.dots-btn');
      if(b){b.classList.remove('btn-spring');void b.offsetWidth;b.classList.add('btn-spring');b.addEventListener('animationend',function(){b.classList.remove('btn-spring');},{once:true});}
    });
    document.addEventListener('touchstart',function(e){
      var b=e.target.closest('.btn,.filter-btn,.lang-btn,.theme-toggle,.hamburger');
      if(b){b.classList.remove('btn-spring');void b.offsetWidth;b.classList.add('btn-spring');b.addEventListener('animationend',function(){b.classList.remove('btn-spring');},{once:true});}
    },{passive:true});
  }

  if(!isLow&&!('ontouchstart' in window)&&window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.feature-card,.about-section-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5;var y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(700px) rotateX('+(-y*5)+'deg) rotateY('+(x*5)+'deg) translateY(-5px) scale(1.018)';card.style.transition='transform .06s ease';},{passive:true});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';});
    });
    document.querySelectorAll('.img-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5;var y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) rotateX('+(-y*3)+'deg) rotateY('+(x*3)+'deg) scale(1.03) translateY(-6px)';card.style.transition='transform .06s ease';},{passive:true});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .55s cubic-bezier(.16,1,.3,1)';});
    });
    document.querySelectorAll('.download-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5;var y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(1000px) rotateX('+(-y*2)+'deg) rotateY('+(x*2)+'deg) scale(1.01)';card.style.transition='transform .06s ease';},{passive:true});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';});
    });
  }

  var revealThreshold=isLow?0.01:0.06;
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){
    if(e.isIntersecting){
      e.target.classList.add('visible');
      obs.unobserve(e.target);
      // Clear will-change after animation to free compositor layers
      e.target.addEventListener('transitionend',function(){
        e.target.style.willChange='auto';
      },{once:true});
    }
  });},{threshold:revealThreshold,rootMargin:'0px 0px -8px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});

  document.querySelectorAll('a.nav-link,a.mob-link,.footer-nav-link').forEach(function(link){
    var href=link.getAttribute('href');if(!href||href.startsWith('http')||href.startsWith('#'))return;
    link.addEventListener('click',function(e){e.preventDefault();document.body.classList.add('page-leaving');setTimeout(function(){window.location.href=href;},190);});
  });

  function closeAllPopups(){document.querySelectorAll('.popup-menu.open').forEach(function(p){p.classList.remove('open');p.classList.add('close');p.addEventListener('animationend',function(){p.classList.remove('close');p.style.display='';},{once:true});});}
  function initDots(scope){(scope||document).querySelectorAll('.post-dots').forEach(function(wrapper){var btn=wrapper.querySelector('.dots-btn'),pid=wrapper.dataset.popup,popup=document.getElementById(pid);if(!btn||!popup)return;btn.addEventListener('click',function(e){e.stopPropagation();var isOpen=popup.classList.contains('open');closeAllPopups();if(!isOpen){popup.style.display='flex';popup.classList.remove('close');requestAnimationFrame(function(){popup.classList.add('open');});}});});}
  initDots();
  document.addEventListener('click',function(e){if(!e.target.closest('.post-dots'))closeAllPopups();});
  window.initDots=initDots;

  document.addEventListener('click',function(e){var btn=e.target.closest('.filter-btn');if(!btn)return;document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');if(window.applyFilters)window.applyFilters();});
  document.addEventListener('selectstart',function(e){if(!e.target.closest('a[href]')&&!e.target.closest('input')&&!e.target.closest('textarea'))e.preventDefault();});
  document.addEventListener('contextmenu',function(e){if(!e.target.closest('a[href]')&&!e.target.closest('img'))e.preventDefault();});
  document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&['u','s'].includes(e.key.toLowerCase()))e.preventDefault();});

  loadUpdateJson();
  loadNotification();

  // Add body transition AFTER first paint - prevents FCP/LCP delay
  window.addEventListener('load', function(){
    setTimeout(function(){
      document.body.style.transition = 'background .4s cubic-bezier(.4,0,.2,1),color .4s cubic-bezier(.4,0,.2,1)';
    }, 150);
  }, {once:true});
});

window.applyFilters=function(){var activeBtn=document.querySelector('.filter-btn.active');var f=activeBtn?activeBtn.dataset.filter:'all';var si=document.getElementById('postSearch');var sv=si?si.value.toLowerCase().trim():'';document.querySelectorAll('.post-card').forEach(function(card){var tags=(card.dataset.tags||'').split(/\s+/);var text=card.textContent.toLowerCase();var mf=(f==='all'||tags.indexOf(f)!==-1);var ms=!sv||text.indexOf(sv)!==-1;if(mf&&ms){card.style.removeProperty('display');card.style.animation='filterReveal .26s cubic-bezier(.16,1,.3,1) both';card.addEventListener('animationend',function(){card.style.animation='';},{once:true});}else{card.style.display='none';}});};

async function loadUpdateJson(){
  var UPDATE_URL='https://aetherdev01.github.io/SnapPerf/server/updates.json';
  var FALLBACK_URL='https://raw.githubusercontent.com/aetherdev01/SnapPerf/main/server/update.json';
  var d=null;
  try{var res=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(res.ok)d=await res.json();}catch(e){}
  if(!d){try{var res2=await fetch(FALLBACK_URL,{cache:'no-store'});if(res2.ok)d=await res2.json();}catch(e){}}
  if(!d)return;
  window._updateJsonCache=d;
  var ver=d.version||'';
  var vmatch=ver.match(/^(v[\d.]+)/i);
  var short=vmatch?vmatch[1]:ver.replace(/\s*\(.*?\)\s*/g,'').trim();
  var isBeta=/beta/i.test(ver);
  var typeLabel=isBeta?'Beta':'Stable';
  var typeClass=isBeta?'badge-orange':'badge-green';
  var zipUrl=d.urlZip||d.zipUrl||'';
  var mirror=d.link||'';
  var heroVer=document.getElementById('heroVersion');if(heroVer)heroVer.textContent=short;
  var dlV=document.getElementById('dlVersion');if(dlV)dlV.textContent=short;
  var dlVT=document.getElementById('dlVersionText');if(dlVT)dlVT.textContent=short+' '+typeLabel;
  var dlT=document.getElementById('dlTitle');if(dlT)dlT.textContent='SnapPerf '+short;
  var clB=document.getElementById('clBadge');if(clB)clB.textContent=short;
  var clT=document.getElementById('changelogTitle');if(clT)clT.textContent='Changelog '+short;
  document.querySelectorAll('.dl-type-badge').forEach(function(b){b.className='badge '+typeClass+' dl-type-badge';b.textContent=typeLabel;});
  if(zipUrl){var heroDl=document.getElementById('heroDl');if(heroDl)heroDl.href=zipUrl;var dlBtn=document.getElementById('dlBtn');if(dlBtn)dlBtn.href=zipUrl;}
  if(mirror){var mirBtn=document.getElementById('mirrorBtn');if(mirBtn)mirBtn.href=mirror;}
  if(d.changelog)loadChangelog(d.changelog);
}

async function loadChangelog(url){
  var colors=['#3b8fff','#00c787','#ff375f','#bf5af2','#ff9f0a','#30d158'];
  try{var res=await fetch(url,{cache:'no-store'});if(!res.ok)return;var text=await res.text();var items=[];text.split('\n').forEach(function(line){var m=line.match(/^[-*]\s+(.+)/);if(m)items.push({text:escHTML(m[1].trim()),color:colors[items.length%colors.length]});});if(!items.length)return;var cl=document.getElementById('clList');if(cl)cl.innerHTML=items.map(function(it){return'<li><span class="cl-dot" style="background:'+it.color+'"></span>'+it.text+'</li>';}).join('');}catch(e){}
}

async function loadNotification(){
  var NOTIF_URL='https://raw.githubusercontent.com/aetherdev01/SnapPerf/main/server/notification.json';
  try{
    var res=await fetch(NOTIF_URL+'?t='+Date.now(),{cache:'no-store'});
    if(!res.ok)return;
    var d=await res.json();
    if(!d||!d.active||!d.message)return;
    var dismissed=localStorage.getItem('sp-notif-dismissed');
    if(dismissed&&dismissed===String(d.id))return;
    showNotifDialog(d);
  }catch(e){}
}

function showNotifDialog(d){
  if(document.getElementById('sp-notif-dialog'))return;
  var TYPE_META={
    info:{color:'#3d88ff',bg:'rgba(61,136,255,.1)',border:'rgba(61,136,255,.25)',label:'Informasi'},
    success:{color:'#00e5b8',bg:'rgba(0,229,184,.1)',border:'rgba(0,229,184,.25)',label:'Berhasil!'},
    warning:{color:'#ff9f0a',bg:'rgba(255,159,10,.1)',border:'rgba(255,159,10,.28)',label:'Perhatian'},
    alert:{color:'#ff375f',bg:'rgba(255,55,95,.1)',border:'rgba(255,55,95,.28)',label:'Peringatan'}
  };
  var type=(d.type&&TYPE_META[d.type])?d.type:'info';
  var meta=TYPE_META[type];
  var title=d.title||(type==='info'?'Informasi':type==='success'?'Berhasil!':type==='warning'?'Perhatian':'Peringatan Penting');
  var ICONS={
    info:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>',
    success:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warning:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 9v4M12 17h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>',
    alert:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  var overlay=document.createElement('div');overlay.id='sp-notif-dialog';overlay.className='sp-nd-overlay';
  overlay.innerHTML='<div class="sp-nd-card sp-nd-'+type+'">'
    +'<div class="sp-nd-top">'
    +'<div class="sp-nd-logo-wrap"><img class="sp-nd-logo" src="assets/aether.webp" alt="SnapPerf"/></div>'
    +'<div class="sp-nd-icon-wrap" style="background:'+meta.bg+';border-color:'+meta.border+'">'+ICONS[type]+'</div>'
    +'</div>'
    +'<div class="sp-nd-body">'
    +'<div class="sp-nd-title">'+escHTML(title)+'</div>'
    +'<div class="sp-nd-msg">'+escHTML(d.message)+'</div>'
    +'</div>'
    +'<div class="sp-nd-footer">'
    +'<button class="sp-nd-close" id="sp-nd-btn" style="background:'+meta.color+'">Mengerti</button>'
    +'</div>'
    +'</div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){requestAnimationFrame(function(){overlay.classList.add('sp-nd-show');});});
  function closeDialog(){
    overlay.classList.add('sp-nd-hide');
    overlay.addEventListener('animationend',function(){if(overlay.parentNode)overlay.remove();},{once:true});
    if(d.id)localStorage.setItem('sp-notif-dismissed',String(d.id));
  }
  document.getElementById('sp-nd-btn').addEventListener('click',closeDialog);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closeDialog();});
}
