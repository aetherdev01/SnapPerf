'use strict';

var SP_SB_URL='https://mdielsfkmchwtdfrlidz.supabase.co';
var SP_SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWVsc2ZrbWNod3RkZnJsaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODMxNjUsImV4cCI6MjA4OTA1OTE2NX0.hjIv88F5pJMfeyM18-WdUeNYjL2mocl7KEQona9w1uY';
var SP_EJS_PK='r6IpGiVo5FCdjbdFA';
var SP_EJS_SVC='service_r5n8ytl';
var SP_EJS_TPL='template_wznau9x';
var SP_OWN_EMAIL='aldigeming41@gmail.com';

var spSb=null;
var spUser=null;
var spAnonId=null;

function spEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function spGetAnonId(){
  if(spAnonId)return spAnonId;
  var id=localStorage.getItem('sp-anon-id');
  if(!id){id='a'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('sp-anon-id',id);}
  spAnonId=id;return id;
}

function spLoadUser(){
  try{var u=localStorage.getItem('sp-user');return u?JSON.parse(u):null;}catch(e){return null;}
}
function spSaveUser(u){try{localStorage.setItem('sp-user',JSON.stringify(u));}catch(e){}}
function spClearUser(){localStorage.removeItem('sp-user');}

function spRelTime(ts){
  if(!ts)return'baru saja';
  var d=new Date(ts);if(isNaN(d.getTime()))return'baru saja';
  var s=(Date.now()-d.getTime())/1000;
  if(s<55)return'baru saja';
  if(s<3600)return Math.floor(s/60)+' menit lalu';
  if(s<86400)return Math.floor(s/3600)+' jam lalu';
  if(s<604800)return Math.floor(s/86400)+' hari lalu';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
}
function spFullDate(ts){
  if(!ts)return'';
  var d=new Date(ts);if(isNaN(d.getTime()))return'';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function spShowToast(msg,ok){
  document.querySelectorAll('.sp-toast').forEach(function(t){t.remove();});
  var t=document.createElement('div');
  t.className='sp-toast '+(ok?'sp-toast-ok':'sp-toast-err');
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.classList.add('sp-toast-show');});
  setTimeout(function(){
    t.classList.remove('sp-toast-show');
    t.addEventListener('transitionend',function(){if(t.parentNode)t.remove();},{once:true});
  },2800);
}

function spCloseModal(id){
  var m=document.getElementById(id);if(!m)return;
  m.classList.remove('sp-auth-open');
  setTimeout(function(){if(m.parentNode)m.remove();},280);
}

function spUpdateAllBars(){
  document.querySelectorAll('.sp-engage-bar').forEach(function(bar){
    var u=spUser;
    var av=bar.querySelector('.sp-user-avatar');
    var nm=bar.querySelector('.sp-auth-name');
    var lo=bar.querySelector('.sp-logout-btn');
    var li=bar.querySelector('.sp-login-hint');
    var tag=bar.dataset.tag;
    var wrap=bar.closest('.sp-engage-bar-wrap');
    var sec=wrap?wrap.querySelector('.sp-cmt-section'):null;
    var aw=sec?sec.querySelector('.sp-anon-wrap'):null;
    if(av){if(u){av.src='';av.style.display='none';}else{av.src='';av.style.display='none';}}
    if(nm)nm.textContent=u?u.name:'';
    if(lo)lo.style.display=u?'inline-flex':'none';
    if(li)li.style.display=u?'none':'inline-flex';
    if(aw)aw.style.display=u?'none':'flex';
    if(tag)spRefreshEngagement(tag,bar);
  });
}

function spShowLoginModal(onDone){
  if(document.getElementById('sp-login-modal'))return;
  var m=document.createElement('div');m.id='sp-login-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card">'
    +'<button class="sp-auth-x" id="sp-modal-x">\u00d7</button>'
    +'<div class="sp-auth-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Masuk untuk Komentar</h3>'
    +'<p class="sp-auth-sub">Masukkan nama yang akan tampil di komentar kamu.</p>'
    +'<div class="sp-name-form">'
    +'<input class="sp-name-input" id="sp-name-inp" type="text" placeholder="Nama kamu..." maxlength="32" autocomplete="off" spellcheck="false"/>'
    +'<button class="sp-name-submit ripple-btn" id="sp-name-ok">Lanjut</button>'
    +'</div>'
    +'<div class="sp-auth-or"><span>atau</span></div>'
    +'<button class="sp-anon-direct ripple-btn" id="sp-anon-ok">Komentar sebagai Anonim</button>'
    +'</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('sp-auth-open');});

  var inp=document.getElementById('sp-name-inp');
  setTimeout(function(){if(inp)inp.focus();},200);

  function doName(){
    var nm=inp?inp.value.trim():'';
    if(!nm){inp&&inp.classList.add('sp-shake');setTimeout(function(){inp&&inp.classList.remove('sp-shake');},400);return;}
    spUser={uid:'u_'+nm.toLowerCase().replace(/\W/g,'').slice(0,12)+'_'+spGetAnonId().slice(-6),name:nm,via:'name'};
    spSaveUser(spUser);
    spCloseModal('sp-login-modal');
    spShowToast('\u2713 Hai, '+spUser.name+'!',true);
    spUpdateAllBars();
    if(onDone)onDone(false);
  }
  function doAnon(){
    spCloseModal('sp-login-modal');
    if(onDone)onDone(true);
  }

  document.getElementById('sp-name-ok').addEventListener('click',doName);
  document.getElementById('sp-anon-ok').addEventListener('click',doAnon);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doName();}});
  document.getElementById('sp-modal-x').addEventListener('click',function(){spCloseModal('sp-login-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-login-modal');});
}

function spMakeCmtEl(d){
  var ts=d.created_at||new Date().toISOString();
  var rel=spRelTime(ts);var full=spFullDate(ts);
  var isAnon=!!d.is_anonymous;
  var name=isAnon?'Anonim':spEsc(d.display_name||'User');
  var ini=(d.display_name||'?').charAt(0).toUpperCase();
  var av=isAnon
    ?'<div class="sp-cmt-av sp-cmt-av-fallback sp-cmt-anon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>'
    :'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc(ini)+'</div>';
  var el=document.createElement('div');el.className='sp-cmt-item';
  el.innerHTML=av+'<div class="sp-cmt-body"><div class="sp-cmt-meta">'
    +'<span class="sp-cmt-name'+(isAnon?' sp-cmt-anon-name':'')+'">'+name+'</span>'
    +'<span class="sp-cmt-time" title="'+full+'">'+rel+'</span>'
    +'</div><span class="sp-cmt-text">'+spEsc(d.text)+'</span></div>';
  return el;
}

async function spRefreshEngagement(tag,bar){
  if(!tag||!bar||!spSb)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  try{
    var lr=await spSb.from('sp_likes').select('user_id').eq('release_tag',tag);
    if(lr.error)throw lr.error;
    var rows=lr.data||[];
    var liked=rows.some(function(r){return r.user_id===uid;});
    var lb=bar.querySelector('.sp-like-btn');
    var lc=bar.querySelector('.sp-like-count');
    if(lb)lb.classList.toggle('sp-liked',liked);
    if(lc)lc.textContent=rows.length>0?rows.length:'';
  }catch(e){}
  try{
    var cr=await spSb.from('sp_comments').select('id',{count:'exact',head:true}).eq('release_tag',tag);
    if(!cr.error){
      var cc=bar.querySelector('.sp-comment-count');
      if(cc)cc.textContent=cr.count||0;
    }
  }catch(e){}
}
window.spLoadEngagement=spRefreshEngagement;

async function spToggleLike(tag,bar){
  if(!tag||!bar)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  var lb=bar.querySelector('.sp-like-btn');
  var lc=bar.querySelector('.sp-like-count');
  var wasLiked=lb&&lb.classList.contains('sp-liked');
  var cur=parseInt((lc?lc.textContent:'')||'0',10)||0;
  if(lb)lb.classList.toggle('sp-liked',!wasLiked);
  if(lc)lc.textContent=wasLiked?Math.max(0,cur-1)||'':cur+1;
  if(!spSb){return;}
  try{
    var ex=await spSb.from('sp_likes').select('user_id').eq('release_tag',tag).eq('user_id',uid);
    if(ex.error)throw ex.error;
    if(ex.data&&ex.data.length>0){
      var del=await spSb.from('sp_likes').delete().eq('release_tag',tag).eq('user_id',uid);
      if(del.error)throw del.error;
    }else{
      var ins=await spSb.from('sp_likes').insert({release_tag:tag,user_id:uid});
      if(ins.error)throw ins.error;
    }
    await spRefreshEngagement(tag,bar);
  }catch(e){
    if(lb)lb.classList.toggle('sp-liked',wasLiked);
    if(lc)lc.textContent=cur||'';
  }
}

async function spFetchComments(tag,section){
  if(!spSb||!section||!tag)return;
  var list=section.querySelector('.sp-cmt-list');if(!list)return;
  list.innerHTML='<div class="sp-cmt-loading"><div class="sp-spin-sm"></div></div>';
  try{
    var r=await spSb.from('sp_comments').select('*').eq('release_tag',tag).order('created_at',{ascending:true}).limit(60);
    if(r.error)throw r.error;
    list.innerHTML='';
    if(!r.data||!r.data.length){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';return;}
    r.data.forEach(function(d){list.appendChild(spMakeCmtEl(d));});
    list.scrollTop=list.scrollHeight;
  }catch(e){list.innerHTML='<p class="sp-no-cmt sp-cmt-err">Gagal memuat. Cek koneksi.</p>';}
}

async function spSendComment(tag,text,isAnon,section,bar){
  var trimmed=text.trim();if(!trimmed)return;
  var inp=section.querySelector('.sp-cmt-input');
  var btn=section.querySelector('.sp-cmt-send');
  var list=section.querySelector('.sp-cmt-list');

  if(btn){btn.disabled=true;btn.textContent='...';}

  var uid=isAnon?spGetAnonId():(spUser?spUser.uid:spGetAnonId());
  var dname=isAnon?'Anonim':(spUser?spUser.name:'Anonim');

  var optData={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||!spUser,created_at:new Date().toISOString()};
  var emptyEl=list?list.querySelector('.sp-no-cmt'):null;
  if(emptyEl)emptyEl.remove();
  var optEl=spMakeCmtEl(optData);
  optEl.style.opacity='0.5';
  if(list){list.appendChild(optEl);list.scrollTop=list.scrollHeight;}
  if(inp)inp.value='';
  if(btn){btn.disabled=false;btn.textContent='Kirim';}

  if(!spSb){
    optEl.style.opacity='1';
    spShowToast('\u2713 Komentar terkirim',true);
    if(bar){var cc=bar.querySelector('.sp-comment-count');if(cc)cc.textContent=parseInt(cc.textContent||'0',10)+1;}
    return;
  }

  try{
    var payload={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||!spUser};
    var ins=await spSb.from('sp_comments').insert(payload).select();
    if(ins.error)throw ins.error;
    var saved=ins.data&&ins.data[0];
    optEl.style.opacity='1';
    if(saved&&saved.created_at){
      var te=optEl.querySelector('.sp-cmt-time');
      if(te){te.textContent=spRelTime(saved.created_at);te.title=spFullDate(saved.created_at);}
    }
    spShowToast('\u2713 Komentar terkirim!',true);
    await spRefreshEngagement(tag,bar);
    if(!isAnon&&spUser&&spUser.via==='name')spSendEmail(tag,spUser.name,trimmed);
  }catch(e){
    optEl.remove();
    var errMsg=e&&e.message?e.message:'';
    if(errMsg.indexOf('relation')!==-1||errMsg.indexOf('does not exist')!==-1){
      spShowToast('\u2717 Tabel belum dibuat di Supabase! Lihat README.',false);
    }else if(errMsg.indexOf('violates')!==-1||errMsg.indexOf('policy')!==-1){
      spShowToast('\u2717 RLS policy blokir insert. Jalankan SQL setup.',false);
    }else{
      spShowToast('\u2717 Gagal kirim: '+(errMsg||'error'),false);
    }
    if(list&&!list.querySelector('.sp-cmt-item'))list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';
  }
}

function spSendEmail(tag,name,text){
  if(typeof emailjs==='undefined')return;
  try{
    emailjs.init(SP_EJS_PK);
    emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{to_email:SP_OWN_EMAIL,commenter_name:name,release_tag:tag,comment_text:text,site_url:'https://aetherdev01.github.io/SnapPerf/updates'});
  }catch(e){}
}

function spBuildEngage(tag){
  var s=spEsc(tag);
  return '<div class="sp-engage-bar-wrap">'
    +'<div class="sp-engage-bar" data-tag="'+s+'">'
    +'<button class="sp-like-btn ripple-btn" aria-label="Like">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-like-count"></span></button>'
    +'<button class="sp-cmt-toggle ripple-btn">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-comment-count">0</span></button>'
    +'<div class="sp-user-row" style="margin-left:auto;display:flex;align-items:center;gap:.4rem">'
    +'<img class="sp-user-avatar" src="" alt="" style="display:none"/>'
    +'<span class="sp-auth-name"></span>'
    +'<button class="sp-logout-btn ripple-btn" style="display:none">Logout</button>'
    +'<button class="sp-login-hint ripple-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Login</button>'
    +'</div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+s+'">'
    +'<div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-row">'
    +'<input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off" spellcheck="false"/>'
    +'<div class="sp-anon-wrap" style="display:flex;flex-shrink:0;align-items:center">'
    +'<label class="sp-anon-label"><input type="checkbox" class="sp-anon-chk"><span>Anonim</span></label>'
    +'</div>'
    +'<button class="sp-cmt-send ripple-btn">Kirim</button>'
    +'</div>'
    +'</div>'
    +'</div>';
}
window.spBuildEngage=spBuildEngage;

document.addEventListener('DOMContentLoaded',function(){
  if(typeof window.supabase!=='undefined'){
    try{spSb=window.supabase.createClient(SP_SB_URL,SP_SB_ANON);}catch(e){}
  }
  spUser=spLoadUser();
  spUpdateAllBars();

  document.addEventListener('click',function(e){

    var lb=e.target.closest('.sp-like-btn');
    if(lb){
      var bar=lb.closest('.sp-engage-bar');
      if(bar)spToggleLike(bar.dataset.tag,bar);
      return;
    }

    var ct=e.target.closest('.sp-cmt-toggle');
    if(ct){
      var bar=ct.closest('.sp-engage-bar');if(!bar)return;
      var tag=bar.dataset.tag;
      var wrap=bar.closest('.sp-engage-bar-wrap');if(!wrap)return;
      var sec=wrap.querySelector('.sp-cmt-section');if(!sec)return;
      var isOpen=sec.classList.contains('sp-cmt-open');
      if(isOpen){
        sec.classList.remove('sp-cmt-open');
        sec.addEventListener('transitionend',function(){
          if(!sec.classList.contains('sp-cmt-open'))sec.style.display='none';
        },{once:true});
      }else{
        sec.style.display='block';
        requestAnimationFrame(function(){sec.classList.add('sp-cmt-open');});
        if(!sec.dataset.loaded){sec.dataset.loaded='1';spFetchComments(tag,sec);}
        spRefreshEngagement(tag,bar);
        var aw=sec.querySelector('.sp-anon-wrap');
        if(aw)aw.style.display=spUser?'none':'flex';
        if(!spUser){
          spShowLoginModal(function(asAnon){
            var inpEl=sec.querySelector('.sp-cmt-input');
            var chkEl=sec.querySelector('.sp-anon-chk');
            var awEl=sec.querySelector('.sp-anon-wrap');
            if(asAnon){
              if(chkEl)chkEl.checked=true;
              if(inpEl)inpEl.placeholder='Komentar sebagai Anonim...';
              if(awEl)awEl.style.display='flex';
            }else{
              if(awEl)awEl.style.display='none';
            }
            if(inpEl)setTimeout(function(){inpEl.focus();},100);
          });
        }else{
          var inpEl=sec.querySelector('.sp-cmt-input');
          if(inpEl)setTimeout(function(){inpEl.focus();},200);
        }
      }
      return;
    }

    var sb=e.target.closest('.sp-cmt-send');
    if(sb){
      var sec=sb.closest('.sp-cmt-section');if(!sec)return;
      var tag=sec.dataset.tag;
      var inp=sec.querySelector('.sp-cmt-input');
      if(!inp||!inp.value.trim())return;
      var chk=sec.querySelector('.sp-anon-chk');
      var isAnon=!spUser||(chk?chk.checked:true);
      if(!spUser&&!isAnon){spShowLoginModal(null);return;}
      var wrap=sec.closest('.sp-engage-bar-wrap');
      var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
      spSendComment(tag,inp.value,isAnon,sec,bar);
      return;
    }

    var lo=e.target.closest('.sp-logout-btn');
    if(lo){spClearUser();spUser=null;spUpdateAllBars();spShowToast('Berhasil logout',true);return;}

    var lh=e.target.closest('.sp-login-hint');
    if(lh){spShowLoginModal(function(){spUpdateAllBars();});return;}
  });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target.classList.contains('sp-cmt-input'))return;
    e.preventDefault();
    var sec=e.target.closest('.sp-cmt-section');if(!sec)return;
    if(!e.target.value.trim())return;
    var chk=sec.querySelector('.sp-anon-chk');
    var isAnon=!spUser||(chk?chk.checked:true);
    if(!spUser&&!isAnon){spShowLoginModal(null);return;}
    var tag=sec.dataset.tag;
    var wrap=sec.closest('.sp-engage-bar-wrap');
    var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
    spSendComment(tag,e.target.value,isAnon,sec,bar);
  });

  document.addEventListener('change',function(e){
    var chk=e.target.closest('.sp-anon-chk');if(!chk)return;
    var row=chk.closest('.sp-cmt-row');
    var inp=row?row.querySelector('.sp-cmt-input'):null;
    if(inp)inp.placeholder=chk.checked?'Komentar sebagai Anonim...':'Tulis komentar...';
  });
});
