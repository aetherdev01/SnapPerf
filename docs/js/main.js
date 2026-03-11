'use strict';
(function(){
  var t=localStorage.getItem('sp-theme')||'light';
  document.documentElement.setAttribute('data-theme',t);
  if(window.location.pathname.endsWith('.html')){
    var clean=window.location.pathname.replace(/\.html$/,'');
    window.history.replaceState(null,'',clean+window.location.search+window.location.hash);
  }
})();

document.addEventListener('DOMContentLoaded',function(){
  // Scroll progress bar – appended to <html> so parent opacity transitions don't affect it
  var bar=document.createElement('div');
  bar.className='scroll-progress';
  document.documentElement.appendChild(bar);

  function updateBar(){
    var scrollTop=window.pageYOffset||document.documentElement.scrollTop||0;
    var totalH=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
    var total=totalH-window.innerHeight;
    bar.style.width=(total>0?Math.min(100,(scrollTop/total)*100):0)+'%';
  }
  window.addEventListener('scroll',updateBar,{passive:true});
  window.addEventListener('resize',updateBar,{passive:true});
  setTimeout(updateBar,200);

  // Theme toggle
  var themeBtn=document.getElementById('themeToggle');
  if(themeBtn){
    themeBtn.addEventListener('click',function(){
      var c=document.documentElement.getAttribute('data-theme');
      var n=c==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',n);
      localStorage.setItem('sp-theme',n);
    });
  }

  // Hamburger / mobile menu
  var ham=document.getElementById('hamburger');
  var mob=document.getElementById('mobileMenu');
  if(ham&&mob){
    ham.addEventListener('click',function(){
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    document.addEventListener('click',function(e){
      if(!ham.contains(e.target)&&!mob.contains(e.target)){
        ham.classList.remove('open');
        mob.classList.remove('open');
      }
    });
  }

  // Ripple effect
  function addRipple(el,e){
    var ex=el.querySelector('.ripple');
    if(ex)ex.remove();
    var r=el.getBoundingClientRect();
    var s=Math.max(r.width,r.height)*2;
    var x=e.clientX-r.left-s/2;
    var y=e.clientY-r.top-s/2;
    var rp=document.createElement('span');
    rp.className='ripple';
    rp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+x+'px;top:'+y+'px;';
    el.appendChild(rp);
    rp.addEventListener('animationend',function(){rp.remove();});
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('.ripple-btn');
    if(b)addRipple(b,e);
  });
  document.addEventListener('mousedown',function(e){
    var b=e.target.closest('.btn');
    if(b){
      b.classList.remove('btn-spring');
      void b.offsetWidth;
      b.classList.add('btn-spring');
      b.addEventListener('animationend',function(){b.classList.remove('btn-spring');},{once:true});
    }
  });

  // Scroll-reveal
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
    });
  },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});

  // Page transitions for internal links
  document.querySelectorAll('a.nav-link,a.mob-link,.footer-links a').forEach(function(link){
    var href=link.getAttribute('href');
    if(!href||href.startsWith('http')||href.startsWith('#'))return;
    link.addEventListener('click',function(e){
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function(){window.location.href=href;},200);
    });
  });

  // Popup dots menu
  document.querySelectorAll('.post-dots').forEach(function(wrapper){
    var btn=wrapper.querySelector('.dots-btn');
    var pid=wrapper.dataset.popup;
    var popup=document.getElementById(pid);
    if(!btn||!popup)return;
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var isOpen=popup.classList.contains('open');
      closeAllPopups();
      if(!isOpen){
        popup.style.display='flex';
        popup.classList.remove('close');
        requestAnimationFrame(function(){popup.classList.add('open');});
      }
    });
  });
  function closeAllPopups(){
    document.querySelectorAll('.popup-menu.open').forEach(function(p){
      p.classList.remove('open');
      p.classList.add('close');
      p.addEventListener('animationend',function(){
        p.classList.remove('close');
        p.style.display='';
      },{once:true});
    });
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('.filter-btn'))closeAllPopups();
  });

  // Filter buttons for updates page
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.filter-btn');
    if(!btn)return;
    document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    if(window.applyFilters)window.applyFilters();
  });

  // Security hardening
  document.addEventListener('selectstart',function(e){
    if(!e.target.closest('a[href]')&&!e.target.closest('input')&&!e.target.closest('textarea'))e.preventDefault();
  });
  document.addEventListener('contextmenu',function(e){
    if(!e.target.closest('a[href]')&&!e.target.closest('img'))e.preventDefault();
  });
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&['u','s'].includes(e.key.toLowerCase()))e.preventDefault();
  });

  loadUpdateJson();
});

// Global filter function used by updates page search + filter buttons
window.applyFilters=function(){
  var activeBtn=document.querySelector('.filter-btn.active');
  var f=activeBtn?activeBtn.dataset.filter:'all';
  var si=document.getElementById('postSearch');
  var searchVal=si?si.value.toLowerCase().trim():'';
  document.querySelectorAll('.post-card').forEach(function(card){
    var tags=(card.dataset.tags||'').split(/\s+/);
    var text=card.textContent.toLowerCase();
    var matchFilter=(f==='all'||tags.indexOf(f)!==-1);
    var matchSearch=!searchVal||text.indexOf(searchVal)!==-1;
    if(matchFilter&&matchSearch){
      card.style.removeProperty('display');
      card.style.opacity='1';
    }else{
      card.style.display='none';
      card.style.opacity='0';
    }
  });
};

function escHTML(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
window.escHTML=escHTML;

async function loadUpdateJson(){
  try{
    var res=await fetch('https://raw.githubusercontent.com/aetherdev22/snapperf/main/update.json',{cache:'no-store'});
    if(!res.ok)return;
    var d=await res.json();
    var ver=d.version||'';
    var zipUrl=d.zipUrl||'';
    var mirror=d.link||'';
    var short=ver.replace(/\s*\(Stable\)\s*/gi,'').replace(/\s*Stable\s*/gi,'').trim();

    var heroV=document.getElementById('heroVersion');
    var dlV=document.getElementById('dlVersion');
    if(dlV)dlV.textContent=short;
    var dlT=document.getElementById('dlTitle');
    if(dlT)dlT.textContent='SnapPerf '+short;
    var dlVT=document.getElementById('dlVersionText');
    if(dlVT)dlVT.textContent=short+' Stable';
    var clB=document.getElementById('clBadge');
    if(clB)clB.textContent=short;
    var clT=document.getElementById('changelogTitle');
    if(clT)clT.textContent='Changelog '+short;
    var heroDl=document.getElementById('heroDl');
    if(heroDl&&zipUrl)heroDl.href=zipUrl;
    var dlBtn=document.getElementById('dlBtn');
    if(dlBtn&&zipUrl)dlBtn.href=zipUrl;
    var mirBtn=document.getElementById('mirrorBtn');
    if(mirBtn&&mirror)mirBtn.href=mirror;

    if(d.changelog)loadChangelog(d.changelog);
  }catch(err){}
}

async function loadChangelog(url){
  try{
    var res=await fetch(url,{cache:'no-store'});
    if(!res.ok)return;
    var text=await res.text();
    var lines=text.split('\n');
    var items=[];
    var colors=['#3b8fff','#00c787','#ff375f','#bf5af2','#ff9f0a','#30d158'];
    var i=0;
    for(var l=0;l<lines.length;l++){
      var m=lines[l].match(/^[-*]\s+(.+)/);
      if(m){items.push({text:escHTML(m[1].trim()),color:colors[i%colors.length]});i++;}
    }
    if(!items.length)return;
    var cl=document.getElementById('clList');
    if(cl){
      cl.innerHTML=items.map(function(it){
        return '<li><span class="cl-dot" style="background:'+it.color+'"></span>'+it.text+'</li>';
      }).join('');
    }
  }catch(err){}
}
