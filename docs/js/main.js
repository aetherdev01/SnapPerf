'use strict';
(function(){
  const saved=localStorage.getItem('sp-theme')||'light';
  document.documentElement.setAttribute('data-theme',saved);
})();
document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.createElement('div');
  bar.className='scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll',()=>{
    const total=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(total>0?(window.scrollY/total)*100:0)+'%';
  },{passive:true});

  const themeBtn=document.getElementById('themeToggle');
  if(themeBtn){
    themeBtn.addEventListener('click',()=>{
      const cur=document.documentElement.getAttribute('data-theme');
      const next=cur==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',next);
      localStorage.setItem('sp-theme',next);
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
  },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

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

  document.addEventListener('selectstart',(e)=>{
    if(!e.target.closest('a[href]'))e.preventDefault();
  });
  document.addEventListener('contextmenu',(e)=>{
    if(!e.target.closest('a[href]')&&!e.target.closest('img'))e.preventDefault();
  });

  document.addEventListener('keydown',(e)=>{
    if((e.ctrlKey||e.metaKey)&&['u','s','a'].includes(e.key.toLowerCase())){
      if(e.key.toLowerCase()==='a'&&!e.target.closest('input, textarea'))return;
      e.preventDefault();
    }
  });
});
