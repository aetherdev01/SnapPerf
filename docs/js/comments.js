'use strict';

var SP_GOOGLE_CLIENT_ID='537556008394-ovkhtafjkuljmoumb03frmp7vb9b3f7q.apps.googleusercontent.com';
var SP_SB_URL='https://mdielsfkmchwtdfrlidz.supabase.co';
var SP_SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWVsc2ZrbWNod3RkZnJsaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODMxNjUsImV4cCI6MjA4OTA1OTE2NX0.hjIv88F5pJMfeyM18-WdUeNYjL2mocl7KEQona9w1uY';
var SP_EJS_PK='r6IpGiVo5FCdjbdFA';
var SP_EJS_SVC='service_r5n8ytl';
var SP_EJS_TPL='template_wznau9x';
var SP_OWN_EMAIL='aldigeming41@gmail.com';

var SP_SB_OK=SP_SB_URL.indexOf('FILL')===-1&&SP_SB_ANON.indexOf('FILL')===-1;
var SP_GSI_OK=SP_GOOGLE_CLIENT_ID.indexOf('FILL')===-1;

var spUser=null,spSb=null,spAnonId=null,spGsiLoaded=false;

function spEsc(s){return window.escHTML?window.escHTML(s):String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function spGetAnonId(){
  if(spAnonId)return spAnonId;
  var id=localStorage.getItem('sp-anon-id');
  if(!id){id='anon_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('sp-anon-id',id);}
  spAnonId=id;return id;
}

function spRelTime(ts){
  var d=new Date(ts);if(isNaN(d.getTime()))return'baru saja';
  var s=(Date.now()-d.getTime())/1000;
  if(s<55)return'baru saja';
  if(s<3600)return Math.floor(s/60)+' menit lalu';
  if(s<86400)return Math.floor(s/3600)+' jam lalu';
  if(s<604800)return Math.floor(s/86400)+' hari lalu';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
}
function spFullDate(ts){
  var d=new Date(ts);if(isNaN(d.getTime()))return'';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function spGetStoredUser(){
  try{var u=localStorage.getItem('sp-user');return u?JSON.parse(u):null;}catch(e){return null;}
}
function spSaveUser(u){localStorage.setItem('sp-user',JSON.stringify(u));}
function spClearUser(){localStorage.removeItem('sp-user');localStorage.removeItem('sp-gsi-cred');}

function spDecodeJwt(t){
  try{var b=t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(b+'='.repeat((4-b.length%4)%4)));}
  catch(e){return null;}
}

function spInitSb(){
  if(!SP_SB_OK)return;
  if(typeof window.supabase==='undefined')return;
  try{spSb=window.supabase.createClient(SP_SB_URL,SP_SB_ANON);}catch(e){}
}

function spRestoreSession(){
  var u=spGetStoredUser();
  if(u){spUser=u;spUpdateAllUI();return;}
  if(SP_GSI_OK){
    var cred=localStorage.getItem('sp-gsi-cred');
    if(cred){var p=spDecodeJwt(cred);if(p&&p.exp*1000>Date.now()){spUser={uid:p.sub,name:p.name||'User',avatar:p.picture||'',email:p.email||'',via:'google'};spSaveUser(spUser);spUpdateAllUI();return;}}
    localStorage.removeItem('sp-gsi-cred');
  }
}

function spHandleGsiCredential(resp){
  var p=spDecodeJwt(resp.credential);if(!p)return;
  localStorage.setItem('sp-gsi-cred',resp.credential);
  spUser={uid:p.sub,name:p.name||'User',avatar:p.picture||'',email:p.email||'',via:'google'};
  spSaveUser(spUser);
  spUpdateAllUI();
  spCloseModal('sp-login-modal');
  spShowToast('\u2713 Login sebagai '+spUser.name,true);
  document.querySelectorAll('.sp-engage-bar').forEach(function(b){spLoadEngagement(b.dataset.tag,b);});
}

function spSignOut(){
  if(SP_GSI_OK&&typeof google!=='undefined'&&google.accounts)try{google.accounts.id.disableAutoSelect();}catch(e){}
  spClearUser();spUser=null;spUpdateAllUI();
  spShowToast('Berhasil logout',true);
}

function spUpdateAllUI(){
  var u=spUser;
  document.querySelectorAll('.sp-auth-state').forEach(function(el){
    var av=el.querySelector('.sp-user-avatar');
    var nm=el.querySelector('.sp-auth-name');
    var lo=el.querySelector('.sp-logout-btn');
    var li=el.querySelector('.sp-login-hint');
    var aw=el.closest('.sp-engage-bar-wrap')&&el.closest('.sp-engage-bar-wrap').querySelector('.sp-anon-wrap');
    if(av){if(u&&u.avatar){av.src=u.avatar;av.style.display='block';}else{av.src='';av.style.display='none';}}
    if(nm)nm.textContent=u?u.name:'';
    if(lo)lo.style.display=u?'inline-flex':'none';
    if(li)li.style.display=u?'none':'inline-flex';
    if(aw)aw.style.display=u?'none':'flex';
  });
}

function spShowToast(msg,ok){
  var t=document.createElement('div');
  t.className='sp-toast '+(ok?'sp-toast-ok':'sp-toast-err');
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.classList.add('sp-toast-show');});
  setTimeout(function(){t.classList.remove('sp-toast-show');t.addEventListener('transitionend',function(){if(t.parentNode)t.remove();},{once:true});},2800);
}

function spCloseModal(id){
  var m=document.getElementById(id);
  if(!m)return;
  m.classList.remove('sp-auth-open');
  m.addEventListener('transitionend',function(){if(m.parentNode)m.remove();},{once:true});
}

function spShowLoginModal(onSuccess){
  if(document.getElementById('sp-login-modal'))return;
  var m=document.createElement('div');m.id='sp-login-modal';m.className='sp-auth-overlay';

  var googleSection=SP_GSI_OK
    ?'<div id="sp-gsi-btn-wrap" style="display:flex;justify-content:center;margin:.5rem 0 .8rem"></div>'
     +'<div class="sp-auth-or"><span>atau masukkan nama</span></div>'
    :'';

  m.innerHTML='<div class="sp-auth-card">'
    +'<button class="sp-auth-x" id="sp-modal-x">\u00d7</button>'
    +'<div class="sp-auth-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Masuk untuk Komentar</h3>'
    +'<p class="sp-auth-sub">Gunakan akun Google atau masukkan nama tampilan.</p>'
    +googleSection
    +'<div class="sp-name-form">'
    +'<input class="sp-name-input" id="sp-name-inp" type="text" placeholder="Nama kamu..." maxlength="32" autocomplete="off" spellcheck="false"/>'
    +'<button class="sp-name-submit ripple-btn" id="sp-name-ok">Lanjut</button>'
    +'</div>'
    +'<div class="sp-auth-or" style="margin:.6rem 0 .4rem"><span>atau</span></div>'
    +'<button class="sp-anon-direct ripple-btn" id="sp-anon-direct">Komentar Anonim</button>'
    +'</div>';

  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('sp-auth-open');});

  if(SP_GSI_OK){spLoadGsi(function(){
    if(typeof google!=='undefined'&&google.accounts){
      google.accounts.id.initialize({client_id:SP_GOOGLE_CLIENT_ID,callback:spHandleGsiCredential,auto_select:false,cancel_on_tap_outside:false});
      var wrap=document.getElementById('sp-gsi-btn-wrap');
      if(wrap)google.accounts.id.renderButton(wrap,{theme:'outline',size:'large',shape:'pill',text:'signin_with',width:240});
    }
  });}

  var inp=document.getElementById('sp-name-inp');
  if(inp)setTimeout(function(){inp.focus();},180);

  function doName(){
    var nm=(inp?inp.value.trim():'');if(!nm)return;
    spUser={uid:'usr_'+btoa(nm).replace(/[^a-z0-9]/gi,'').slice(0,16)+'_'+spGetAnonId().slice(-6),name:nm,avatar:'',via:'name'};
    spSaveUser(spUser);spUpdateAllUI();
    spCloseModal('sp-login-modal');
    spShowToast('\u2713 Masuk sebagai '+nm,true);
    document.querySelectorAll('.sp-engage-bar').forEach(function(b){spLoadEngagement(b.dataset.tag,b);});
    if(onSuccess)onSuccess();
  }

  function doAnon(){
    spCloseModal('sp-login-modal');
    if(onSuccess)onSuccess(true);
  }

  document.getElementById('sp-name-ok').addEventListener('click',doName);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter')doName();});
  document.getElementById('sp-anon-direct').addEventListener('click',doAnon);
  document.getElementById('sp-modal-x').addEventListener('click',function(){spCloseModal('sp-login-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-login-modal');});
}

function spLoadGsi(cb){
  if(spGsiLoaded){cb();return;}
  var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;
  s.onload=function(){spGsiLoaded=true;cb();};
  document.head.appendChild(s);
}

function spMakeCommentEl(d){
  var ts=d.created_at||new Date().toISOString();
  var rel=spRelTime(ts);var full=spFullDate(ts);
  var isAnon=!!d.is_anonymous;
  var name=isAnon?'Anonim':spEsc(d.display_name||'User');
  var av=isAnon
    ?'<div class="sp-cmt-av sp-cmt-av-fallback sp-cmt-anon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>'
    :(d.avatar_url
      ?'<img class="sp-cmt-av" src="'+spEsc(d.avatar_url)+'" loading="lazy" onerror="this.style.display=\'none\'"/>'
      :'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc((d.display_name||'?').charAt(0).toUpperCase())+'</div>');
  var el=document.createElement('div');el.className='sp-cmt-item';
  el.innerHTML=av+'<div class="sp-cmt-body"><div class="sp-cmt-meta">'
    +'<span class="sp-cmt-name'+(isAnon?' sp-cmt-anon-name':'')+'">'+name+'</span>'
    +'<span class="sp-cmt-time" title="'+full+'">'+rel+'</span>'
    +'</div><span class="sp-cmt-text">'+spEsc(d.text)+'</span></div>';
  return el;
}

async function spRefreshEngagement(tag,bar){
  if(!bar||!tag)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  if(spSb){
    try{
      var lr=await spSb.from('likes').select('user_id').eq('release_tag',tag);
      var rows=lr.data||[];
      var liked=rows.some(function(r){return r.user_id===uid;});
      var lb=bar.querySelector('.sp-like-btn');var lc=bar.querySelector('.sp-like-count');
      if(lb)lb.classList.toggle('sp-liked',liked);
      if(lc)lc.textContent=rows.length>0?rows.length:'';
    }catch(e){}
    try{
      var cr=await spSb.from('comments').select('id').eq('release_tag',tag);
      var cc=bar.querySelector('.sp-comment-count');
      if(cc)cc.textContent=(cr.data||[]).length||0;
    }catch(e){}
  }
}
window.spLoadEngagement=spRefreshEngagement;

async function spRefreshComments(tag,section){
  if(!spSb||!section||!tag)return;
  var list=section.querySelector('.sp-cmt-list');if(!list)return;
  try{
    var r=await spSb.from('comments').select('*').eq('release_tag',tag).order('created_at',{ascending:true}).limit(60);
    list.innerHTML='';
    if(!r.data||!r.data.length){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';return;}
    r.data.forEach(function(d){list.appendChild(spMakeCommentEl(d));});
    list.scrollTop=list.scrollHeight;
  }catch(e){}
}

async function spDoToggleLike(tag,bar){
  var uid=spUser?spUser.uid:spGetAnonId();
  if(spSb){
    try{
      var ex=await spSb.from('likes').select('user_id').eq('release_tag',tag).eq('user_id',uid);
      if(ex.data&&ex.data.length>0){
        await spSb.from('likes').delete().eq('release_tag',tag).eq('user_id',uid);
      }else{
        await spSb.from('likes').insert({release_tag:tag,user_id:uid});
      }
    }catch(e){}
  }
  await spRefreshEngagement(tag,bar);
}

async function spDoSendComment(tag,text,isAnon,section,bar){
  if(!text.trim())return;
  var trimmed=text.trim();
  var inp=section.querySelector('.sp-cmt-input');
  var btn=section.querySelector('.sp-cmt-send');
  var list=section.querySelector('.sp-cmt-list');

  if(btn){btn.disabled=true;btn.textContent='...';}

  var data={
    release_tag:tag,
    user_id:isAnon?spGetAnonId():(spUser?spUser.uid:spGetAnonId()),
    display_name:isAnon?'Anonim':(spUser?spUser.name:'Anonim'),
    avatar_url:isAnon?'':(spUser?spUser.avatar:''),
    text:trimmed,
    is_anonymous:isAnon||!spUser,
    created_at:new Date().toISOString()
  };

  var emptyEl=list?list.querySelector('.sp-no-cmt'):null;
  if(emptyEl)emptyEl.remove();
  var optEl=spMakeCommentEl(data);
  optEl.style.opacity='0.5';
  if(list){list.appendChild(optEl);list.scrollTop=list.scrollHeight;}
  if(inp)inp.value='';
  if(btn){btn.disabled=false;btn.textContent='Kirim';}

  var ok=true;
  if(spSb){
    try{
      var ins=await spSb.from('comments').insert({
        release_tag:data.release_tag,user_id:data.user_id,
        display_name:data.display_name,avatar_url:data.avatar_url,
        text:data.text,is_anonymous:data.is_anonymous
      }).select().maybeSingle();
      if(ins.error)throw ins.error;
      optEl.style.opacity='1';
      if(ins.data&&ins.data.created_at){
        var te=optEl.querySelector('.sp-cmt-time');
        if(te){te.textContent=spRelTime(ins.data.created_at);te.title=spFullDate(ins.data.created_at);}
      }
      await spRefreshEngagement(tag,bar);
      if(!isAnon&&spUser)spSendEmail(tag,spUser.name,trimmed);
    }catch(e){
      ok=false;optEl.remove();
      if(list&&!list.querySelector('.sp-cmt-item'))list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';
    }
  }else{
    optEl.style.opacity='1';
    var lc=bar?bar.querySelector('.sp-comment-count'):null;
    if(lc)lc.textContent=parseInt(lc.textContent||'0',10)+1;
  }

  if(ok)spShowToast('\u2713 Komentar terkirim!',true);
  else spShowToast('\u2717 Gagal mengirim komentar',false);
}

function spSendEmail(tag,name,text){
  if(typeof emailjs==='undefined'||SP_EJS_PK.indexOf('FILL')===0)return;
  emailjs.init(SP_EJS_PK);
  emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{to_email:SP_OWN_EMAIL,commenter_name:name,release_tag:tag,comment_text:text,site_url:'https://aetherdev01.github.io/SnapPerf/updates'}).catch(function(){});
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
    +'<div class="sp-auth-state" style="margin-left:auto;display:flex;align-items:center;gap:.4rem">'
    +'<img class="sp-user-avatar" style="display:none" alt=""/>'
    +'<span class="sp-auth-name"></span>'
    +'<button class="sp-logout-btn ripple-btn" style="display:none">Logout</button>'
    +(SP_GSI_OK?'<button class="sp-login-hint ripple-btn"><svg width="11" height="11" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/></svg>Login</button>':'')
    +'</div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+s+'">'
    +'<div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-row">'
    +'<input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off"/>'
    +'<div class="sp-anon-wrap" style="display:flex">'
    +'<label class="sp-anon-label"><input type="checkbox" class="sp-anon-chk"/><span>Anonim</span></label>'
    +'</div>'
    +'<button class="sp-cmt-send ripple-btn">Kirim</button>'
    +'</div>'
    +'</div>'
    +'</div>';
}
window.spBuildEngage=spBuildEngage;

document.addEventListener('DOMContentLoaded',function(){
  spInitSb();
  spRestoreSession();

  document.addEventListener('click',function(e){

    var lb=e.target.closest('.sp-like-btn');
    if(lb){
      lb.disabled=true;
      var bar=lb.closest('.sp-engage-bar');
      var tag=bar?bar.dataset.tag:'';
      if(!tag){lb.disabled=false;return;}
      var lc=bar.querySelector('.sp-like-count');
      var curLiked=lb.classList.contains('sp-liked');
      lb.classList.toggle('sp-liked',!curLiked);
      var cur=parseInt(lc?lc.textContent||'0':'0',10)||0;
      if(lc)lc.textContent=curLiked?Math.max(0,cur-1):cur+1;
      spDoToggleLike(tag,bar).then(function(){lb.disabled=false;}).catch(function(){lb.disabled=false;});
      return;
    }

    var ct=e.target.closest('.sp-cmt-toggle');
    if(ct){
      var bar=ct.closest('.sp-engage-bar');if(!bar)return;
      var tag=bar.dataset.tag;
      var wrap=bar.closest('.sp-engage-bar-wrap');if(!wrap)return;
      var sec=wrap.querySelector('.sp-cmt-section[data-tag]');if(!sec)return;
      var open=sec.classList.contains('sp-cmt-open');
      if(open){
        sec.classList.remove('sp-cmt-open');
        sec.addEventListener('transitionend',function h(){sec.style.display='none';sec.removeEventListener('transitionend',h);});
      }else{
        sec.style.display='block';
        requestAnimationFrame(function(){sec.classList.add('sp-cmt-open');});
        if(!sec.dataset.loaded){
          sec.dataset.loaded='1';
          spRefreshComments(tag,sec);
        }
        spRefreshEngagement(tag,bar);
        var aw=sec.querySelector('.sp-anon-wrap');
        if(aw)aw.style.display=spUser?'none':'flex';
        if(!spUser){
          spShowLoginModal(function(asAnon){
            if(asAnon){
              var chk=sec.querySelector('.sp-anon-chk');
              if(chk)chk.checked=true;
              var inp2=sec.querySelector('.sp-cmt-input');
              if(inp2){inp2.placeholder='Komentar sebagai Anonim...';inp2.focus();}
            }else{
              var inp2=sec.querySelector('.sp-cmt-input');
              if(inp2)inp2.focus();
              var aw2=sec.querySelector('.sp-anon-wrap');
              if(aw2)aw2.style.display='none';
            }
          });
        }else{
          var inp3=sec.querySelector('.sp-cmt-input');
          if(inp3)setTimeout(function(){inp3.focus();},260);
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
      var anonChk=sec.querySelector('.sp-anon-chk');
      var isAnon=!spUser||(anonChk?anonChk.checked:true);
      var wrap=sec.closest('.sp-engage-bar-wrap');
      var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
      spDoSendComment(tag,inp.value,isAnon,sec,bar);
      return;
    }

    var lo=e.target.closest('.sp-logout-btn');
    if(lo){spSignOut();return;}

    var lh=e.target.closest('.sp-login-hint');
    if(lh){spShowLoginModal();return;}
  });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target.classList.contains('sp-cmt-input'))return;
    e.preventDefault();
    var sec=e.target.closest('.sp-cmt-section');if(!sec)return;
    if(!e.target.value.trim())return;
    var tag=sec.dataset.tag;
    var anonChk=sec.querySelector('.sp-anon-chk');
    var isAnon=!spUser||(anonChk?anonChk.checked:true);
    var wrap=sec.closest('.sp-engage-bar-wrap');
    var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
    spDoSendComment(tag,e.target.value,isAnon,sec,bar);
  });

  document.addEventListener('change',function(e){
    var chk=e.target.closest('.sp-anon-chk');if(!chk)return;
    var inp=chk.closest('.sp-cmt-row')&&chk.closest('.sp-cmt-row').querySelector('.sp-cmt-input');
    if(inp)inp.placeholder=chk.checked?'Komentar sebagai Anonim...':'Tulis komentar...';
  });
});
