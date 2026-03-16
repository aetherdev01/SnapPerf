'use strict';
/* Language helpers - delegate to translate.js */
function getCurLang(){return(window.SP_TRANSLATE&&window.SP_TRANSLATE.getLang)?window.SP_TRANSLATE.getLang():(localStorage.getItem('sp-lang')||'id');}
function t(key){return(window.SP_TRANSLATE&&window.SP_TRANSLATE.tr)?window.SP_TRANSLATE.tr(key):(key);}


function escHTML(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
window.escHTML=escHTML;

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
  // applyLang called by translate.js automatically

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

  function toggleLang(){if(window.SP_TRANSLATE){window.SP_TRANSLATE.toggle();}else{var next=getCurLang()==='en'?'id':'en';localStorage.setItem('sp-lang',next);if(window.applyLang)window.applyLang();}}
  // Lang buttons wired by translate.js - keep hamburger close behavior
  document.addEventListener('sp:langchange',function(){if(ham)ham.classList.remove('open');if(mobMenu)mobMenu.classList.remove('open');});

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
  var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:revealThreshold,rootMargin:'0px 0px -8px 0px'});
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
  if(zipUrl){
    // heroDl stays as updates.html - user goes to updates page from hero
    var dlBtn=document.getElementById('dlBtn');
    if(dlBtn)dlBtn.href=zipUrl;
  }
  var mirBtn=document.getElementById('mirrorBtn');
  if(mirBtn){
    if(mirror){mirBtn.href=mirror;mirBtn.style.display='';}
    else{mirBtn.style.display='none';}
  }
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
  var ICONS={info:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>',success:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',warning:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 9v4M12 17h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>',alert:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="'+meta.color+'" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="'+meta.color+'" stroke-width="2.2" stroke-linecap="round"/></svg>'};
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
