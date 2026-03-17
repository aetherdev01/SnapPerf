'use strict';
var LANG={en:{'nav.home':'Home','nav.updates':'Updates','nav.about':'About','hero.badge.magisk':'Magisk Module','hero.badge.chip':'Snapdragon','hero.desc':"A powerful Magisk performance module engineered for Snapdragon devices. Unlock your device\u2019s true potential \u2014 smoother, faster, smarter.",'hero.dl':'Download','hero.tg':'Telegram','hero.gh':'GitHub','feat.tag':'Features','feat.h2':'Why SnapPerf?','feat.sub':'Engineered for Snapdragon. Built for performance enthusiasts.','feat1.h':'Performance Boost','feat1.p':'Optimized CPU governor and scheduler tweaks for maximum responsiveness on every Snapdragon core cluster.','feat1.b':'Performance','feat2.h':'Battery Saver','feat2.p':'Intelligent power profiles reduce unnecessary drain without sacrificing the user experience.','feat2.b':'Battery','feat3.h':'Display Smoothness','feat3.p':'Fine-tuned frame pacing and Adreno GPU settings for a consistently fluid display experience.','feat3.b':'Display','feat4.h':'Thermal Control','feat4.p':'Manages heat throttling behavior to sustain peak performance during extended gaming sessions.','feat4.b':'Thermal','feat5.h':'Network Boost','feat5.p':'TCP buffer and scheduler optimisations to reduce network latency in online games and apps.','feat5.b':'Network','feat6.h':'Easy Install','feat6.p':'Flash via Magisk or KernelSU Manager. No ADB required. Instant effect after reboot.','feat6.b':'Plug-and-play','dl.badge':'Stable','dl.desc':'The latest stable release for all supported Snapdragon devices.','dl.chip':'Snapdragon Only','dl.btn':'Direct Download','dl.mirror':'Mirror Link','comm.tag':'Community','comm.h2':'Join the Community','comm.sub':'Stay updated, get support, and connect with other SnapPerf users.','comm.lbl':'Official Channel','comm.desc':'Latest releases, updates & announcements','cl.tag':"What\u2019s New",'cl.all':'View all updates','about.badge':'About','about.h1':'About SnapPerf','about.sub':'The story behind the module and the developer.','about.what.h':'What is SnapPerf?','about.what.p1':'SnapPerf is a Magisk module specifically engineered for Snapdragon-powered Android devices. It applies a curated set of kernel and system-level tweaks to improve overall performance, reduce latency, extend battery life, and enhance display smoothness.','about.what.p2':"Unlike one-size-fits-all tweaks, SnapPerf targets Qualcomm\u2019s unique architecture \u2014 Kryo CPU clusters, Adreno GPU, and Hexagon DSP \u2014 to deliver meaningful, measurable improvements.",'about.req.h':'Requirements','about.req.1':'Rooted Android device (Magisk v24+ or KernelSU)','about.req.2':'Qualcomm Snapdragon SoC','about.req.3':'Android 10 or later recommended','about.req.4':'At least 3 GB RAM','about.install.h':'How to Install','about.install.1':'Download the .zip from the releases page.','about.install.2':'Open Magisk Manager or KernelSU Manager.','about.install.3':'Tap \u201cModules\u201d then \u201cInstall from storage\u201d.','about.install.4':'Select the downloaded zip and reboot.','about.disclaimer.h':'Disclaimer','about.disclaimer.p':'SnapPerf is provided as-is. The developer is not responsible for any damage to your device. Always keep a backup before flashing any module. Use at your own risk.','updates.badge':'Release Updates','updates.h1':'Updates & Releases','updates.sub':'Changelogs, release notes, and history updates.','filter.all':'All','filter.stable':'Stable','filter.fix':'Fix','filter.beta':'Beta','search.placeholder':'Search releases\u2026','footer.copy':'\u00a9 2026 AetherDev'},id:{'nav.home':'Beranda','nav.updates':'Pembaruan','nav.about':'Tentang','hero.badge.magisk':'Modul Magisk','hero.badge.chip':'Snapdragon','hero.desc':"Modul performa Magisk yang powerful, dirancang khusus untuk perangkat Snapdragon. Maksimalkan potensi perangkatmu \u2014 lebih mulus, lebih cepat, lebih pintar.",'hero.dl':'Unduh','hero.tg':'Telegram','hero.gh':'GitHub','feat.tag':'Fitur','feat.h2':'Kenapa SnapPerf?','feat.sub':'Dirancang untuk Snapdragon. Dibangun untuk para enthusiast performa.','feat1.h':'Performa Maksimal','feat1.p':'Tweak CPU governor dan scheduler yang dioptimalkan untuk respons maksimal pada setiap kluster inti Snapdragon.','feat1.b':'Performa','feat2.h':'Hemat Baterai','feat2.p':'Profil daya cerdas yang mengurangi konsumsi baterai tanpa mengorbankan pengalaman pengguna.','feat2.b':'Baterai','feat3.h':'Layar Mulus','feat3.p':'Pengaturan frame pacing dan GPU Adreno yang disempurnakan untuk pengalaman layar yang konsisten dan mulus.','feat3.b':'Layar','feat4.h':'Kontrol Termal','feat4.p':'Mengelola perilaku throttling panas untuk mempertahankan performa puncak selama sesi gaming yang panjang.','feat4.b':'Termal','feat5.h':'Boost Jaringan','feat5.p':'Optimasi TCP buffer dan scheduler untuk mengurangi latensi jaringan dalam game online dan aplikasi.','feat5.b':'Jaringan','feat6.h':'Mudah Dipasang','feat6.p':'Flash via Magisk atau KernelSU Manager. Tanpa ADB. Langsung efektif setelah reboot.','feat6.b':'Plug-and-play','dl.badge':'Stabil','dl.desc':'Rilis stabil terbaru untuk semua perangkat Snapdragon yang didukung.','dl.chip':'Khusus Snapdragon','dl.btn':'Unduh Langsung','dl.mirror':'Link Mirror','comm.tag':'Komunitas','comm.h2':'Bergabung dengan Komunitas','comm.sub':'Tetap update, dapatkan dukungan, dan terhubung dengan pengguna SnapPerf lainnya.','comm.lbl':'Saluran Resmi','comm.desc':'Rilis terbaru, pembaruan & pengumuman','cl.tag':'Yang Baru','cl.all':'Lihat semua pembaruan','about.badge':'Tentang','about.h1':'Tentang SnapPerf','about.sub':'Kisah di balik modul dan developernya.','about.what.h':'Apa itu SnapPerf?','about.what.p1':'SnapPerf adalah modul Magisk yang dirancang khusus untuk perangkat Android bertenaga Snapdragon. Modul ini menerapkan serangkaian tweak kernel dan sistem untuk meningkatkan performa, mengurangi latensi, memperpanjang masa baterai, dan meningkatkan kelancaran layar.','about.what.p2':"Berbeda dari tweak umum, SnapPerf menargetkan arsitektur unik Qualcomm \u2014 kluster CPU Kryo, GPU Adreno, dan DSP Hexagon \u2014 untuk memberikan peningkatan yang nyata dan terukur.",'about.req.h':'Persyaratan','about.req.1':'Perangkat Android yang di-root (Magisk v24+ atau KernelSU)','about.req.2':'SoC Qualcomm Snapdragon','about.req.3':'Android 10 atau lebih baru direkomendasikan','about.req.4':'Minimal 3 GB RAM','about.install.h':'Cara Install','about.install.1':'Unduh file .zip dari halaman rilis.','about.install.2':'Buka Magisk Manager atau KernelSU Manager.','about.install.3':'Ketuk \u201cModul\u201d lalu \u201cInstal dari penyimpanan\u201d.','about.install.4':'Pilih zip yang diunduh dan reboot.','about.disclaimer.h':'Disclaimer','about.disclaimer.p':'SnapPerf disediakan apa adanya. Developer tidak bertanggung jawab atas kerusakan perangkat. Selalu buat backup sebelum memasang modul. Gunakan dengan risiko sendiri.','updates.badge':'Rilis Terbaru','updates.h1':'Pembaruan & Rilis','updates.sub':'Changelog, catatan rilis, dan histori pembaruan.','filter.all':'Semua','filter.stable':'Stabil','filter.fix':'Perbaikan','filter.beta':'Beta','search.placeholder':'Cari rilis\u2026','footer.copy':'\u00a9 2026 AetherDev'}};

function getCurLang(){return localStorage.getItem('sp-lang')||'id';}
function t(key){var l=getCurLang();return(LANG[l]&&LANG[l][key]!=null)?LANG[l][key]:(LANG.en[key]||key);}
function applyLang(){var lang=getCurLang();document.querySelectorAll('[data-i18n]').forEach(function(el){var v=t(el.getAttribute('data-i18n'));if(v!=null)el.textContent=v;});document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){var v=t(el.getAttribute('data-i18n-placeholder'));if(v)el.placeholder=v;});var lbl=document.getElementById('langLabel');if(lbl)lbl.textContent=lang==='id'?'ID':'EN';document.querySelectorAll('.mob-lang-label').forEach(function(m){m.textContent=lang==='id'?'Switch to English':'Beralih ke Bahasa Indonesia';});document.documentElement.lang=lang==='id'?'id':'en';}

function escHTML(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
window.escHTML=escHTML;

(function(){var th=localStorage.getItem('sp-theme')||'light';document.documentElement.setAttribute('data-theme',th);if(!localStorage.getItem('sp-lang'))localStorage.setItem('sp-lang','id');if(window.location.pathname.endsWith('.html')){var clean=window.location.pathname.replace(/\.html$/,'');window.history.replaceState(null,'',clean+window.location.search+window.location.hash);}})();

document.addEventListener('DOMContentLoaded',function(){
  requestAnimationFrame(function(){document.body.classList.remove('page-transitioning');});
  applyLang();

  var bar=document.createElement('div');bar.className='scroll-progress';document.documentElement.appendChild(bar);
  var rafPending=false;
  function updateBar(){if(rafPending)return;rafPending=true;requestAnimationFrame(function(){var top=window.pageYOffset||0;var total=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-window.innerHeight;bar.style.width=(total>0?Math.min(100,(top/total)*100):0)+'%';rafPending=false;});}
  window.addEventListener('scroll',updateBar,{passive:true});window.addEventListener('resize',updateBar,{passive:true});setTimeout(updateBar,200);

  var themeBtn=document.getElementById('themeToggle');
  if(themeBtn)themeBtn.addEventListener('click',function(){
    var root=document.documentElement;var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    themeBtn.classList.add('theme-spin');themeBtn.addEventListener('animationend',function(){themeBtn.classList.remove('theme-spin');},{once:true});
    root.classList.add('theme-transitioning');root.setAttribute('data-theme',next);localStorage.setItem('sp-theme',next);
    var flash=document.createElement('div');flash.className='theme-flash';document.body.appendChild(flash);
    flash.addEventListener('animationend',function(){flash.remove();root.classList.remove('theme-transitioning');});
  });

  function toggleLang(){var next=getCurLang()==='en'?'id':'en';localStorage.setItem('sp-lang',next);applyLang();document.body.style.transition='opacity .12s ease';document.body.style.opacity='0.6';requestAnimationFrame(function(){requestAnimationFrame(function(){document.body.style.opacity='1';setTimeout(function(){document.body.style.transition='';document.body.style.opacity='';},160);});});}
  var langBtn=document.getElementById('langToggle');if(langBtn)langBtn.addEventListener('click',toggleLang);
  document.querySelectorAll('.mob-lang-btn').forEach(function(btn){btn.addEventListener('click',function(){toggleLang();if(ham)ham.classList.remove('open');if(mobMenu)mobMenu.classList.remove('open');});});

  var ham=document.getElementById('hamburger');var mobMenu=document.getElementById('mobileMenu');
  if(ham&&mobMenu){ham.addEventListener('click',function(e){e.stopPropagation();ham.classList.toggle('open');mobMenu.classList.toggle('open');});document.addEventListener('click',function(e){if(!ham.contains(e.target)&&!mobMenu.contains(e.target)){ham.classList.remove('open');mobMenu.classList.remove('open');}});}

  document.addEventListener('click',function(e){
    var b=e.target.closest('.ripple-btn');if(!b)return;
    var ex=b.querySelector('.ripple');if(ex)ex.remove();
    var r=b.getBoundingClientRect();var s=Math.max(r.width,r.height)*2.2;
    var rp=document.createElement('span');rp.className='ripple';rp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px;';
    b.appendChild(rp);rp.addEventListener('animationend',function(){rp.remove();});
  });

  document.addEventListener('mousedown',function(e){
    var b=e.target.closest('.btn, .filter-btn, .lang-btn, .theme-toggle, .hamburger, .dots-btn');
    if(b){b.classList.remove('btn-spring');void b.offsetWidth;b.classList.add('btn-spring');b.addEventListener('animationend',function(){b.classList.remove('btn-spring');},{once:true});}
  });
  document.addEventListener('touchstart',function(e){
    var b=e.target.closest('.btn, .filter-btn, .lang-btn, .theme-toggle, .hamburger');
    if(b){b.classList.remove('btn-spring');void b.offsetWidth;b.classList.add('btn-spring');b.addEventListener('animationend',function(){b.classList.remove('btn-spring');},{once:true});}
  },{passive:true});

  if(!('ontouchstart' in window)&&window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.feature-card,.about-section-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-0.5;var y=(e.clientY-r.top)/r.height-0.5;card.style.transform='perspective(700px) rotateX('+(-y*5)+'deg) rotateY('+(x*5)+'deg) translateY(-5px) scale(1.018)';card.style.transition='transform .08s ease';});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .45s cubic-bezier(.34,1.56,.64,1)';});
    });
    document.querySelectorAll('.img-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-0.5;var y=(e.clientY-r.top)/r.height-0.5;card.style.transform='perspective(900px) rotateX('+(-y*3)+'deg) rotateY('+(x*3)+'deg) scale(1.03) translateY(-6px)';card.style.transition='transform .08s ease';});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)';});
    });
    document.querySelectorAll('.download-card').forEach(function(card){
      card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-0.5;var y=(e.clientY-r.top)/r.height-0.5;card.style.transform='perspective(1000px) rotateX('+(-y*2)+'deg) rotateY('+(x*2)+'deg) scale(1.01)';card.style.transition='transform .08s ease';});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform .45s cubic-bezier(.34,1.56,.64,1)';});
    });
  }

  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0,rootMargin:'0px 0px -10px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});

  document.querySelectorAll('a.nav-link,a.mob-link,.footer-nav-link').forEach(function(link){var href=link.getAttribute('href');if(!href||href.startsWith('http')||href.startsWith('#'))return;link.addEventListener('click',function(e){e.preventDefault();document.body.classList.add('page-leaving');setTimeout(function(){window.location.href=href;},200);});});

  function closeAllPopups(){document.querySelectorAll('.popup-menu.open').forEach(function(p){p.classList.remove('open');p.classList.add('close');p.addEventListener('animationend',function(){p.classList.remove('close');p.style.display='';},{once:true});});}
  function initDots(scope){(scope||document).querySelectorAll('.post-dots').forEach(function(wrapper){var btn=wrapper.querySelector('.dots-btn'),pid=wrapper.dataset.popup,popup=document.getElementById(pid);if(!btn||!popup)return;btn.addEventListener('click',function(e){e.stopPropagation();var isOpen=popup.classList.contains('open');closeAllPopups();if(!isOpen){popup.style.display='flex';popup.classList.remove('close');requestAnimationFrame(function(){popup.classList.add('open');});}});});}
  initDots();document.addEventListener('click',function(e){if(!e.target.closest('.post-dots'))closeAllPopups();});
  window.initDots=initDots;

  document.addEventListener('click',function(e){var btn=e.target.closest('.filter-btn');if(!btn)return;document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');if(window.applyFilters)window.applyFilters();});
  document.addEventListener('selectstart',function(e){if(!e.target.closest('a[href]')&&!e.target.closest('input')&&!e.target.closest('textarea'))e.preventDefault();});
  document.addEventListener('contextmenu',function(e){if(!e.target.closest('a[href]')&&!e.target.closest('img'))e.preventDefault();});
  document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&['u','s'].includes(e.key.toLowerCase()))e.preventDefault();});

  loadUpdateJson();
  initNotifications();
  initAdminTrigger();
});

window.applyFilters=function(){var activeBtn=document.querySelector('.filter-btn.active');var f=activeBtn?activeBtn.dataset.filter:'all';var si=document.getElementById('postSearch');var sv=si?si.value.toLowerCase().trim():'';document.querySelectorAll('.post-card').forEach(function(card){var tags=(card.dataset.tags||'').split(/\s+/);var text=card.textContent.toLowerCase();var mf=(f==='all'||tags.indexOf(f)!==-1);var ms=!sv||text.indexOf(sv)!==-1;if(mf&&ms){card.style.removeProperty('display');card.style.animation='filterReveal .28s ease both';card.addEventListener('animationend',function(){card.style.animation='';},{once:true});}else{card.style.display='none';}});};

async function loadUpdateJson(){
  var UPDATE_URL='https://aetherdev01.github.io/SnapPerf/server/updates.json';
  var FALLBACK_URL='https://raw.githubusercontent.com/aetherdev01/SnapPerf/main/server/update.json';
  var d=null;
  try{var res=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(res.ok)d=await res.json();}catch(e){}
  if(!d){try{var res2=await fetch(FALLBACK_URL,{cache:'no-store'});if(res2.ok)d=await res2.json();}catch(e){}}
  if(!d)return;

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

  var typeBadges=document.querySelectorAll('.dl-type-badge');
  typeBadges.forEach(function(b){b.className='badge '+typeClass+' dl-type-badge';b.textContent=typeLabel;});

  if(zipUrl){var heroDl=document.getElementById('heroDl');if(heroDl)heroDl.href=zipUrl;var dlBtn=document.getElementById('dlBtn');if(dlBtn)dlBtn.href=zipUrl;}
  if(mirror){var mirBtn=document.getElementById('mirrorBtn');if(mirBtn)mirBtn.href=mirror;}
  if(d.changelog)loadChangelog(d.changelog);
}

async function loadChangelog(url){
  var colors=['#3b8fff','#00c787','#ff375f','#bf5af2','#ff9f0a','#30d158'];
  try{var res=await fetch(url,{cache:'no-store'});if(!res.ok)return;var text=await res.text();var items=[];text.split('\n').forEach(function(line){var m=line.match(/^[-*]\s+(.+)/);if(m)items.push({text:escHTML(m[1].trim()),color:colors[items.length%colors.length]});});if(!items.length)return;var cl=document.getElementById('clList');if(cl)cl.innerHTML=items.map(function(it){return'<li><span class="cl-dot" style="background:'+it.color+'"></span>'+it.text+'</li>';}).join('');}catch(e){}
}

var NOTIF_RAW='https://raw.githubusercontent.com/aetherdev01/SnapPerf/main/server/notification.json';
var NOTIF_API='https://api.github.com/repos/aetherdev01/SnapPerf/contents/server/notification.json';
var notifPollTimer=null;

function initNotifications(){
  fetchNotification();
  notifPollTimer=setInterval(fetchNotification,30000);
}

async function fetchNotification(){
  try{
    var res=await fetch(NOTIF_RAW+'?t='+Date.now(),{cache:'no-store'});
    if(!res.ok)return;
    var d=await res.json();
    if(!d.active||!d.id||!d.message)return;
    var dismissed=JSON.parse(localStorage.getItem('sp-dismissed')||'[]');
    if(dismissed.indexOf(d.id)!==-1)return;
    var existing=document.getElementById('sp-notif');
    if(existing&&existing.dataset.id===d.id)return;
    showNotif(d);
  }catch(e){}
}

function notifIcon(type){var icons={info:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#3b8fff" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="#3b8fff" stroke-width="2" stroke-linecap="round"/></svg>',success:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#00c787" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="#00c787" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',warning:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff9f0a" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="#ff9f0a" stroke-width="2" stroke-linecap="round"/></svg>',alert:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ff375f" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="#ff375f" stroke-width="2" stroke-linecap="round"/></svg>'};return icons[type]||icons.info;}

function showNotif(d){
  var existing=document.getElementById('sp-notif');if(existing)existing.remove();
  var el=document.createElement('div');el.id='sp-notif';el.className='sp-notif';el.setAttribute('data-type',d.type||'info');el.setAttribute('data-id',d.id);
  el.innerHTML='<div class="sp-notif-inner"><span class="sp-notif-icon">'+notifIcon(d.type||'info')+'</span><span class="sp-notif-msg">'+escHTML(d.message)+'</span><button class="sp-notif-close" aria-label="Close">&times;</button></div>';
  document.body.appendChild(el);
  el.querySelector('.sp-notif-close').addEventListener('click',function(){dismissNotif(d.id);});
}

function dismissNotif(id){
  var dismissed=JSON.parse(localStorage.getItem('sp-dismissed')||'[]');
  if(dismissed.indexOf(id)===-1)dismissed.push(id);
  localStorage.setItem('sp-dismissed',JSON.stringify(dismissed));
  var el=document.getElementById('sp-notif');
  if(el){el.classList.add('sp-notif-exit');el.addEventListener('animationend',function(){el.remove();},{once:true});}
}

function initAdminTrigger(){
  var seq='';var target='snapperf';
  document.addEventListener('keydown',function(e){
    if(e.target.closest('input,textarea'))return;
    seq+=(e.key||'').toLowerCase();if(seq.length>target.length)seq=seq.slice(-target.length);
    if(seq===target){seq='';openAdminPanel();}
  });
}

function openAdminPanel(){
  if(document.getElementById('sp-admin-overlay'))return;
  var overlay=document.createElement('div');overlay.id='sp-admin-overlay';overlay.className='sp-admin-overlay';
  overlay.innerHTML='<div class="sp-admin-panel" id="sp-admin-panel"><div class="sp-admin-header"><div class="sp-admin-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>SnapPerf Admin</div><button class="sp-admin-close-btn" id="sp-admin-close" aria-label="Close">&times;</button></div><div class="sp-admin-field"><label class="sp-admin-label">GitHub Token (PAT)</label><div class="sp-admin-token-wrap"><input type="password" class="sp-admin-input" id="sp-admin-token" placeholder="ghp_xxxxxxxxxxxx" autocomplete="off" spellcheck="false"/><button class="sp-admin-eye" id="sp-admin-eye" aria-label="Show token"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg></button></div></div><div class="sp-admin-field"><label class="sp-admin-label">Pesan Notifikasi</label><textarea class="sp-admin-input sp-admin-textarea" id="sp-admin-msg" placeholder="Tulis pesan untuk semua pengunjung..." spellcheck="false"></textarea></div><div class="sp-admin-field"><label class="sp-admin-label">Tipe</label><select class="sp-admin-input sp-admin-select" id="sp-admin-type"><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="alert">Alert</option></select></div><div class="sp-admin-actions"><button class="btn btn-primary ripple-btn" id="sp-admin-send" style="font-size:.79rem;padding:.5rem 1rem">Kirim Notifikasi</button><button class="btn btn-ghost ripple-btn" id="sp-admin-clear" style="font-size:.79rem;padding:.5rem 1rem">Hapus Notif</button></div><div class="sp-admin-status" id="sp-admin-status"></div></div>';
  document.body.appendChild(overlay);

  var savedToken=localStorage.getItem('sp-admin-token')||'';
  var tokenInput=document.getElementById('sp-admin-token');if(savedToken)tokenInput.value=savedToken;

  document.getElementById('sp-admin-close').addEventListener('click',closeAdminPanel);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closeAdminPanel();});
  document.addEventListener('keydown',function escClose(e){if(e.key==='Escape'){closeAdminPanel();document.removeEventListener('keydown',escClose);}});

  document.getElementById('sp-admin-eye').addEventListener('click',function(){var inp=document.getElementById('sp-admin-token');var btn=this;if(inp.type==='password'){inp.type='text';btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';}else{inp.type='password';btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';}});

  document.getElementById('sp-admin-send').addEventListener('click',async function(){
    var btn=this;var token=tokenInput.value.trim();var msg=document.getElementById('sp-admin-msg').value.trim();var type=document.getElementById('sp-admin-type').value;var status=document.getElementById('sp-admin-status');
    if(!token||!msg){status.className='sp-admin-status err';status.textContent='Token dan pesan tidak boleh kosong.';status.classList.add('jelly-shake');status.addEventListener('animationend',function(){status.classList.remove('jelly-shake');},{once:true});return;}
    localStorage.setItem('sp-admin-token',token);
    btn.disabled=true;status.className='sp-admin-status sending';status.textContent='Mengirim...';
    var ok=await pushNotif(token,msg,type,true);
    btn.disabled=false;
    if(ok){status.className='sp-admin-status ok';status.textContent='Notifikasi berhasil dikirim!';btn.classList.remove('btn-spring');void btn.offsetWidth;btn.classList.add('btn-spring');}
    else{status.className='sp-admin-status err';status.textContent='Gagal. Cek token atau koneksi.';}
  });

  document.getElementById('sp-admin-clear').addEventListener('click',async function(){
    var btn=this;var token=tokenInput.value.trim();var status=document.getElementById('sp-admin-status');
    if(!token){status.className='sp-admin-status err';status.textContent='Token diperlukan.';return;}
    btn.disabled=true;status.className='sp-admin-status sending';status.textContent='Menghapus...';
    var ok=await pushNotif(token,'',null,false);
    btn.disabled=false;
    if(ok){status.className='sp-admin-status ok';status.textContent='Notifikasi dihapus.';dismissNotif(document.getElementById('sp-notif')?.dataset?.id||'');}
    else{status.className='sp-admin-status err';status.textContent='Gagal. Cek token.';}
  });
}

function closeAdminPanel(){
  var overlay=document.getElementById('sp-admin-overlay');
  if(!overlay)return;
  overlay.classList.add('sp-admin-exit');
  overlay.addEventListener('animationend',function(){overlay.remove();},{once:true});
}

async function pushNotif(token,message,type,active){
  try{
    var getRes=await fetch(NOTIF_API,{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});
    if(!getRes.ok)return false;
    var getJson=await getRes.json();
    var sha=getJson.sha;
    var content={active:active,id:active?'notif_'+Date.now():'notif_default',type:type||'info',message:message,timestamp:Date.now()};
    var encoded=btoa(unescape(encodeURIComponent(JSON.stringify(content,null,2))));
    var putRes=await fetch(NOTIF_API,{method:'PUT',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},body:JSON.stringify({message:active?'Push notification':'Clear notification',content:encoded,sha:sha})});
    return putRes.ok;
  }catch(e){return false;}
}
