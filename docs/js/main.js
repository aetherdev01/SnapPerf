'use strict';
(function(){
  const t=localStorage.getItem('sp-theme')||'light';
  document.documentElement.setAttribute('data-theme',t);
})();

document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('page-in');

  const bar=document.createElement('div');
  bar.className='scroll-progress';
  bar.style.width='0%';
  document.body.appendChild(bar);
  function updateBar(){
    const scrollTop=window.scrollY||document.documentElement.scrollTop;
    const total=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    bar.style.width=(total>0?Math.min(100,(scrollTop/total)*100):0)+'%';
  }
  window.addEventListener('scroll',updateBar,{passive:true});
  updateBar();

  const themeBtn=document.getElementById('themeToggle');
  if(themeBtn){
    themeBtn.addEventListener('click',()=>{
      const c=document.documentElement.getAttribute('data-theme');
      const n=c==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',n);
      localStorage.setItem('sp-theme',n);
    });
  }

  const ham=document.getElementById('hamburger');
  const mob=document.getElementById('mobileMenu');
  if(ham&&mob){
    ham.addEventListener('click',()=>{
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    document.addEventListener('click',(e)=>{
      if(!ham.contains(e.target)&&!mob.contains(e.target)){
        ham.classList.remove('open');
        mob.classList.remove('open');
      }
    });
  }

  function addRipple(el,e){
    const ex=el.querySelector('.ripple');
    if(ex)ex.remove();
    const r=el.getBoundingClientRect();
    const s=Math.max(r.width,r.height)*2;
    const x=e.clientX-r.left-s/2;
    const y=e.clientY-r.top-s/2;
    const rp=document.createElement('span');
    rp.className='ripple';
    rp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+x+'px;top:'+y+'px;';
    el.appendChild(rp);
    rp.addEventListener('animationend',()=>rp.remove());
  }
  document.addEventListener('click',(e)=>{
    const b=e.target.closest('.ripple-btn');
    if(b)addRipple(b,e);
  });

  document.addEventListener('mousedown',(e)=>{
    const b=e.target.closest('.btn');
    if(b){
      b.classList.remove('btn-spring');
      void b.offsetWidth;
      b.classList.add('btn-spring');
      b.addEventListener('animationend',()=>b.classList.remove('btn-spring'),{once:true});
    }
  });

  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
    });
  },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  document.querySelectorAll('a.nav-link, a.mob-link, a.footer-links a').forEach(link=>{
    const href=link.getAttribute('href');
    if(!href||href.startsWith('http')||href.startsWith('#'))return;
    link.addEventListener('click',(e)=>{
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(()=>{window.location.href=href;},200);
    });
  });

  document.querySelectorAll('.post-dots').forEach(wrapper=>{
    const btn=wrapper.querySelector('.dots-btn');
    const pid=wrapper.dataset.popup;
    const popup=document.getElementById(pid);
    if(!btn||!popup)return;
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      const isOpen=popup.classList.contains('open');
      closeAll();
      if(!isOpen){
        popup.style.display='flex';
        popup.classList.remove('close');
        requestAnimationFrame(()=>popup.classList.add('open'));
      }
    });
  });
  function closeAll(){
    document.querySelectorAll('.popup-menu.open').forEach(p=>{
      p.classList.remove('open');
      p.classList.add('close');
      p.addEventListener('animationend',()=>{
        p.classList.remove('close');
        p.style.display='';
      },{once:true});
    });
  }
  document.addEventListener('click',closeAll);

  const filterBtns=document.querySelectorAll('.filter-btn');
  const postCards=document.querySelectorAll('.post-card');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f=btn.dataset.filter;
      postCards.forEach(card=>{
        const tags=card.dataset.tags||'';
        if(f==='all'||tags.includes(f)){
          card.style.display='';
          setTimeout(()=>card.style.opacity='1',10);
        }else{
          card.style.opacity='0';
          setTimeout(()=>card.style.display='none',200);
        }
      });
    });
  });

  const si=document.getElementById('drawSearch');
  const dt=document.getElementById('drawTable');
  if(si&&dt){
    si.addEventListener('input',()=>{
      const q=si.value.toLowerCase().trim();
      dt.querySelectorAll('tbody tr').forEach(row=>{
        row.style.display=row.textContent.toLowerCase().includes(q)?'':'none';
      });
    });
  }

  loadUpdateJson();

  document.addEventListener('selectstart',(e)=>{
    if(!e.target.closest('a[href]'))e.preventDefault();
  });
  document.addEventListener('contextmenu',(e)=>{
    if(!e.target.closest('a[href]')&&!e.target.closest('img'))e.preventDefault();
  });
  document.addEventListener('keydown',(e)=>{
    if((e.ctrlKey||e.metaKey)&&['u','s'].includes(e.key.toLowerCase()))e.preventDefault();
  });
});

async function loadUpdateJson(){
  try{
    const res=await fetch('https://raw.githubusercontent.com/aetherdev22/snapperf/main/update.json',{cache:'no-store'});
    if(!res.ok)return;
    const d=await res.json();
    const ver=d.version||'';
    const zipUrl=d.zipUrl||d.zipUrl||'';
    const mirror=d.link||'';
    const short=ver.replace(' (Stable)','').replace(' Stable','');

    const heroV=document.getElementById('heroVersion');
    if(heroV)heroV.textContent=short+' Stable';
    const dlV=document.getElementById('dlVersion');
    if(dlV)dlV.textContent=short;
    const dlT=document.getElementById('dlTitle');
    if(dlT)dlT.textContent='SnapPerf '+short;
    const dlVT=document.getElementById('dlVersionText');
    if(dlVT)dlVT.textContent=short+' Stable';
    const clB=document.getElementById('clBadge');
    if(clB)clB.textContent=short;
    const clT=document.getElementById('changelogTitle');
    if(clT)clT.textContent='Changelog '+short;
    const heroDl=document.getElementById('heroDl');
    if(heroDl&&zipUrl)heroDl.href=zipUrl;
    const dlBtn=document.getElementById('dlBtn');
    if(dlBtn&&zipUrl)dlBtn.href=zipUrl;
    const mirBtn=document.getElementById('mirrorBtn');
    if(mirBtn&&mirror)mirBtn.href=mirror;

    if(d.changelog){
      loadChangelog(d.changelog);
    }
  }catch(err){}
}

async function loadChangelog(url){
  try{
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok)return;
    const text=await res.text();
    const lines=text.split('\n');
    const items=[];
    const colors=['#3b8fff','#00c787','#ff375f','#bf5af2','#ff9f0a','#30d158'];
    let i=0;
    for(const line of lines){
      const m=line.match(/^[-*]\s+(.+)/);
      if(m){items.push({text:m[1].trim(),color:colors[i%colors.length]});i++;}
    }
    if(!items.length)return;
    const cl=document.getElementById('clList');
    if(cl){
      cl.innerHTML=items.map(it=>`<li><span class="cl-dot" style="background:${it.color}"></span>${it.text}</li>`).join('');
    }
  }catch(err){}
}
