'use strict';

var SP_SB_URL='https://mdielsfkmchwtdfrlidz.supabase.co';
var SP_SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWVsc2ZrbWNod3RkZnJsaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODMxNjUsImV4cCI6MjA4OTA1OTE2NX0.hjIv88F5pJMfeyM18-WdUeNYjL2mocl7KEQona9w1uY';
var SP_EJS_PK='r6IpGiVo5FCdjbdFA';
var SP_EJS_SVC='service_r5n8ytl';
var SP_EJS_TPL='template_wznau9x';
var SP_OWN_EMAIL='aldigeming41@gmail.com';
var SP_OWN_GH='aetherdev01';
var SP_GH_NOTIF_PATH='https://api.github.com/repos/aetherdev01/SnapPerf/contents/server/notification.json';

var SP_TOKEN_SAVED_KEY='sp-token-saved-at';
var SP_TOKEN_META_KEY='sp-token-meta';
var SP_FIRST_LOGIN_KEY='sp-first-login';

var spSb=null,spUser=null,spOwner=null,spAnonId=null;
var spChannels={},spAdminTab='stats';
var spRTConnected=false;
var spAdminLiveCh=null;
var spAdminStatsTick=null;
var spNewCommentCount=0;

/* ── Utils ─────────────────────────────────────── */
function spEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function spGetAnonId(){if(spAnonId)return spAnonId;var id=localStorage.getItem('sp-anon-id');if(!id){id='a'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('sp-anon-id',id);}spAnonId=id;return id;}
function spLoadUser(){try{var u=localStorage.getItem('sp-user');return u?JSON.parse(u):null;}catch(e){return null;}}
function spSaveUser(u){try{localStorage.setItem('sp-user',JSON.stringify(u));}catch(e){}}
function spClearUser(){localStorage.removeItem('sp-user');}

function spSaveToken(t){
  localStorage.setItem('sp-owner-token',t);
  if(!localStorage.getItem(SP_FIRST_LOGIN_KEY))localStorage.setItem(SP_FIRST_LOGIN_KEY,Date.now().toString());
  localStorage.setItem(SP_TOKEN_SAVED_KEY,Date.now().toString());
}
function spLoadToken(){return localStorage.getItem('sp-owner-token')||'';}
function spClearToken(){localStorage.removeItem('sp-owner-token');localStorage.removeItem('sp-owner-data');localStorage.removeItem(SP_TOKEN_SAVED_KEY);localStorage.removeItem(SP_TOKEN_META_KEY);}
function spSaveOwnerData(d){localStorage.setItem('sp-owner-data',JSON.stringify(d));}
function spLoadOwnerData(){try{var d=localStorage.getItem('sp-owner-data');return d?JSON.parse(d):null;}catch(e){return null;}}
function spSaveTokenMeta(m){try{localStorage.setItem(SP_TOKEN_META_KEY,JSON.stringify(m));}catch(e){}}
function spLoadTokenMeta(){try{var m=localStorage.getItem(SP_TOKEN_META_KEY);return m?JSON.parse(m):null;}catch(e){return null;}}

function spDecodeJWT(token){
  try{var p=token.split('.');if(p.length!==3)return null;return JSON.parse(atob(p[1].replace(/-/g,'+').replace(/_/g,'/')));}
  catch(e){return null;}
}

function spRelTime(ts){if(!ts)return'baru saja';var d=new Date(ts);if(isNaN(d.getTime()))return'baru saja';var s=(Date.now()-d.getTime())/1000;if(s<2)return'baru saja';if(s<60)return Math.floor(s)+' detik lalu';if(s<3600)return Math.floor(s/60)+' menit lalu';if(s<86400)return Math.floor(s/3600)+' jam lalu';if(s<604800)return Math.floor(s/86400)+' hari lalu';return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});}
function spFullDate(ts){if(!ts)return'';var d=new Date(ts);if(isNaN(d.getTime()))return'';return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});}
function spFmtDuration(ms){if(!ms||ms<0)return'—';var s=Math.floor(ms/1000);if(s<60)return s+' detik';var m=Math.floor(s/60);if(m<60)return m+' menit';var h=Math.floor(m/60);if(h<24)return h+' jam '+Math.floor(m%60)+'m';var day=Math.floor(h/24);if(day<30)return day+' hari '+Math.floor(h%24)+'j';var mo=Math.floor(day/30);return mo+' bulan '+Math.floor(day%30)+' hari';}
function spTickTimes(){document.querySelectorAll('.sp-cmt-time[data-ts]').forEach(function(el){el.textContent=spRelTime(el.dataset.ts);});}

function spShowToast(msg,ok){document.querySelectorAll('.sp-toast').forEach(function(t){t.remove();});var t=document.createElement('div');t.className='sp-toast '+(ok?'sp-toast-ok':'sp-toast-err');t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(function(){t.classList.add('sp-toast-show');});setTimeout(function(){t.classList.remove('sp-toast-show');t.addEventListener('transitionend',function(){if(t.parentNode)t.remove();},{once:true});},2800);}
function spCloseModal(id){var m=document.getElementById(id);if(!m)return;m.classList.remove('sp-auth-open','sp-panel-open');setTimeout(function(){if(m.parentNode)m.remove();},300);}

/* ── GitHub Auth ─────────────────────────────────── */
async function spVerifyToken(token){
  try{
    var r=await fetch('https://api.github.com/user',{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});
    if(!r.ok)return null;
    var expiry=r.headers.get('github-authentication-token-expiration')||null;
    var rateRemain=parseInt(r.headers.get('x-ratelimit-remaining')||'60',10);
    var rateReset=parseInt(r.headers.get('x-ratelimit-reset')||'0',10)*1000;
    var rateLimit=parseInt(r.headers.get('x-ratelimit-limit')||'60',10);
    var d=await r.json();
    if((d.login||'').toLowerCase()!==SP_OWN_GH.toLowerCase())return null;
    var meta={expiry:expiry,rateRemain:rateRemain,rateReset:rateReset,rateLimit:rateLimit,verifiedAt:Date.now()};
    spSaveTokenMeta(meta);
    return{name:d.name||d.login,login:d.login,avatar:d.avatar_url||'',bio:d.bio||'',followers:d.followers||0,following:d.following||0,publicRepos:d.public_repos||0,ghCreatedAt:d.created_at||null,meta:meta};
  }catch(e){return null;}
}

/* ── Admin Nav ─────────────────────────────────── */
function spInjectAdminNav(data){
  var navLinks=document.querySelector('.nav-links');
  if(navLinks&&!document.getElementById('sp-admin-navbtn')){
    var btn=document.createElement('button');btn.id='sp-admin-navbtn';btn.className='nav-link sp-admin-navlink ripple-btn';
    btn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Admin</span>';
    btn.addEventListener('click',function(){window.location.href='admin.html';});navLinks.appendChild(btn);
  }
  var mobMenu=document.getElementById('mobileMenu');
  if(mobMenu&&!document.getElementById('sp-admin-moblink')){
    var sep=document.createElement('div');sep.className='mob-sep';
    var ml=document.createElement('button');ml.id='sp-admin-moblink';ml.className='mob-link sp-admin-navlink ripple-btn';
    ml.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Admin Panel</span>';
    ml.addEventListener('click',function(){window.location.href='admin.html';});mobMenu.appendChild(sep);mobMenu.appendChild(ml);
  }
  document.querySelectorAll('.sp-cmt-delete').forEach(function(b){b.style.display='inline-flex';});
}
function spRemoveAdminNav(){
  ['sp-admin-navbtn','sp-admin-moblink'].forEach(function(id){var el=document.getElementById(id);if(el){var prev=el.previousElementSibling;if(prev&&prev.classList.contains('mob-sep'))prev.remove();el.remove();}});
  document.querySelectorAll('.sp-cmt-delete').forEach(function(b){b.style.display='none';});
}
async function spInitOwner(){
  var token=spLoadToken();if(!token)return;
  var cached=spLoadOwnerData();
  if(cached){spOwner=cached;spOwner.token=token;spOwner.meta=spLoadTokenMeta();spInjectAdminNav(cached);spUpdateAllBars();return;}
  var data=await spVerifyToken(token);
  if(data){spOwner=data;spOwner.token=token;spSaveOwnerData(data);spInjectAdminNav(data);spUpdateAllBars();}
  else{spClearToken();}
}

/* ── User Bar ─────────────────────────────────── */
function spApplyUserToBar(bar){
  var active=spOwner||spUser;
  var nm=bar.querySelector('.sp-auth-name');var lo=bar.querySelector('.sp-logout-btn');var li=bar.querySelector('.sp-login-hint');
  if(nm)nm.textContent=spOwner?('👑 '+spOwner.name):(spUser?spUser.name:'');
  if(lo)lo.style.display=active?'inline-flex':'none';
  if(li)li.style.display=active?'none':'inline-flex';
  var wrap=bar.closest('.sp-engage-bar-wrap');var sec=wrap?wrap.querySelector('.sp-cmt-section'):null;var aw=sec?sec.querySelector('.sp-anon-wrap'):null;
  if(aw)aw.style.display=active?'none':'flex';
}
function spUpdateAllBars(){document.querySelectorAll('.sp-engage-bar').forEach(function(bar){spApplyUserToBar(bar);var tag=bar.dataset.tag;if(tag)spRefreshEngagement(tag,bar);});}
window.spUpdateAllBars=spUpdateAllBars;

/* ── RT Dot ─────────────────────────────────── */
function spSetRTDot(on){
  spRTConnected=on;
  var dot=document.getElementById('sp-rt-dot');
  if(dot){dot.className='sp-rt-dot '+(on?'sp-rt-on':'sp-rt-off');dot.title=on?'Realtime: Terhubung':'Realtime: Terputus';}
  var lbl=document.getElementById('sp-rt-lbl');
  if(lbl)lbl.textContent=on?'Live':'Offline';
}

/* ── Login Modal ─────────────────────────────── */
function spShowLoginModal(onDone){
  if(document.getElementById('sp-login-modal'))return;
  var m=document.createElement('div');m.id='sp-login-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card"><button class="sp-auth-x" id="sp-modal-x">\u00d7</button><div class="sp-auth-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div><h3 class="sp-auth-title">Masuk untuk Komentar</h3><p class="sp-auth-sub">Nama kamu tersimpan dan tidak perlu diisi ulang.</p><div class="sp-name-form"><input class="sp-name-input" id="sp-name-inp" type="text" placeholder="Nama kamu..." maxlength="32" autocomplete="nickname" spellcheck="false"/><button class="sp-name-submit ripple-btn" id="sp-name-ok">Simpan</button></div><div class="sp-auth-or"><span>atau</span></div><button class="sp-anon-direct ripple-btn" id="sp-anon-ok">Komentar sebagai Anonim</button></div>';
  document.body.appendChild(m);requestAnimationFrame(function(){m.classList.add('sp-auth-open');});
  var inp=document.getElementById('sp-name-inp');setTimeout(function(){if(inp)inp.focus();},200);
  function doName(){var nm=inp?inp.value.trim():'';if(!nm){if(inp){inp.classList.add('sp-shake');setTimeout(function(){inp.classList.remove('sp-shake');},400);}return;}spUser={uid:'u_'+nm.toLowerCase().replace(/\W/g,'').slice(0,12)+'_'+spGetAnonId().slice(-6),name:nm,via:'name'};spSaveUser(spUser);spCloseModal('sp-login-modal');spShowToast('\u2713 Hai, '+spUser.name+'! Login tersimpan.',true);spUpdateAllBars();if(onDone)onDone(false);}
  function doAnon(){spCloseModal('sp-login-modal');if(onDone)onDone(true);}
  document.getElementById('sp-name-ok').addEventListener('click',doName);
  document.getElementById('sp-anon-ok').addEventListener('click',doAnon);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doName();}});
  document.getElementById('sp-modal-x').addEventListener('click',function(){spCloseModal('sp-login-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-login-modal');});
}

function spOpenAdminPanel(){if(document.getElementById('sp-admin-panel'))return;if(!spOwner){spOpenTokenInput();return;}spBuildFullPanel();}
window.spShowOwnerPanel=spOpenAdminPanel;

function spOpenTokenInput(){
  if(document.getElementById('sp-token-modal'))return;
  var m=document.createElement('div');m.id='sp-token-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card"><button class="sp-auth-x" id="sp-tok-x">\u00d7</button><div class="sp-auth-ico sp-owner-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3 class="sp-auth-title">Masuk sebagai Owner</h3><p class="sp-auth-sub">Masukkan GitHub token (ghp_...) untuk mengakses admin panel.</p><div class="sp-name-form sp-token-form"><div class="sp-token-wrap"><input class="sp-name-input" id="sp-tok-inp" type="password" placeholder="paste token GitHub kamu disini.." autocomplete="off" spellcheck="false"/><button class="sp-eye-btn" id="sp-tok-eye" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg></button></div><button class="sp-name-submit ripple-btn" id="sp-tok-ok">Verifikasi</button></div><div class="sp-owner-status" id="sp-tok-status"></div></div>';
  document.body.appendChild(m);requestAnimationFrame(function(){m.classList.add('sp-auth-open');});
  var inp=document.getElementById('sp-tok-inp');var eye=document.getElementById('sp-tok-eye');var ok=document.getElementById('sp-tok-ok');var st=document.getElementById('sp-tok-status');
  var saved=spLoadToken();if(saved&&inp)inp.value=saved;
  setTimeout(function(){if(inp)inp.focus();},200);
  if(eye)eye.addEventListener('click',function(){if(!inp)return;var show=inp.type==='password';inp.type=show?'text':'password';eye.innerHTML=show?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';});
  async function doVerify(){var t=inp?inp.value.trim():'';if(!t)return;if(ok){ok.disabled=true;ok.textContent='Memeriksa...';}if(st){st.className='sp-owner-status sp-own-checking';st.textContent='Menghubungi GitHub...';}var data=await spVerifyToken(t);if(ok){ok.disabled=false;ok.textContent='Verifikasi';}if(data){spSaveToken(t);spSaveOwnerData(data);spOwner=data;spOwner.token=t;spCloseModal('sp-token-modal');spInjectAdminNav(data);spUpdateAllBars();spShowToast('\u2713 Login owner berhasil!',true);setTimeout(spBuildFullPanel,200);}else{if(st){st.className='sp-owner-status sp-own-err';st.textContent='\u2717 Token tidak valid atau bukan akun @'+SP_OWN_GH+'.';}}}
  if(ok)ok.addEventListener('click',doVerify);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doVerify();}});
  document.getElementById('sp-tok-x').addEventListener('click',function(){spCloseModal('sp-token-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-token-modal');});
}

/* ── Build Full Admin Panel ──────────────────── */
function spBuildFullPanel(){
  if(document.getElementById('sp-admin-panel'))return;
  var panel=document.createElement('div');panel.id='sp-admin-panel';panel.className='sp-admin-panel';
  panel.innerHTML='<div class="sp-ap-header">'
    +'<div class="sp-ap-owner">'+(spOwner.avatar?'<img class="sp-ap-av" src="'+spEsc(spOwner.avatar)+'" alt=""/>':'')+'<div><div class="sp-ap-name">'+spEsc(spOwner.name)+'</div><div class="sp-ap-role">Owner · @'+spEsc(spOwner.login||SP_OWN_GH)+'</div></div></div>'
    +'<div class="sp-rt-status" id="sp-rt-status"><span class="sp-rt-dot sp-rt-off" id="sp-rt-dot" title="Realtime: Offline"></span><span class="sp-rt-lbl" id="sp-rt-lbl">Offline</span></div>'
    +'<button class="sp-ap-close ripple-btn" id="sp-ap-close">\u00d7</button>'
    +'</div>'
    +'<div class="sp-ap-tabs">'
    +'<button class="sp-ap-tab active" data-tab="stats"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Statistik<span class="sp-tab-badge" id="sp-stats-badge" style="display:none"></span></button>'
    +'<button class="sp-ap-tab" data-tab="mod"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Moderasi</button>'
    +'<button class="sp-ap-tab" data-tab="notif"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Notifikasi</button>'
    +'<button class="sp-ap-tab" data-tab="license"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Lisensi</button>'
    +'<button class="sp-ap-tab" data-tab="settings"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>Pengaturan</button>'
    +'</div>'
    +'<div class="sp-ap-body" id="sp-ap-body"><div class="sp-ap-loading"><div class="sp-spin-sm"></div></div></div>';
  document.body.appendChild(panel);
  requestAnimationFrame(function(){panel.classList.add('sp-panel-open');});
  document.getElementById('sp-ap-close').addEventListener('click',function(){
    panel.classList.remove('sp-panel-open');
    if(spAdminLiveCh&&spSb){try{spSb.removeChannel(spAdminLiveCh);}catch(e){}}spAdminLiveCh=null;
    clearInterval(spAdminStatsTick);spAdminStatsTick=null;
    spNewCommentCount=0;
    setTimeout(function(){panel.remove();},320);
  });
  panel.querySelectorAll('.sp-ap-tab').forEach(function(btn){
    btn.addEventListener('click',function(){
      panel.querySelectorAll('.sp-ap-tab').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      spAdminTab=btn.dataset.tab;
      if(spAdminTab==='stats'){spNewCommentCount=0;var badge=document.getElementById('sp-stats-badge');if(badge)badge.style.display='none';}
      spRenderAdminTab(spAdminTab);
    });
  });
  spAdminTab='stats';spRenderAdminTab('stats');

  // Realtime admin channel
  if(spSb){
    try{
      spAdminLiveCh=spSb.channel('sp_admin_live')
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'sp_comments'},function(pl){
          spNewCommentCount++;
          if(spAdminTab==='stats'){
            spRenderAdminTab('stats');spNewCommentCount=0;
          } else {
            var badge=document.getElementById('sp-stats-badge');
            if(badge){badge.style.display='inline-flex';badge.textContent=spNewCommentCount>9?'9+':spNewCommentCount;}
          }
        })
        .on('postgres_changes',{event:'DELETE',schema:'public',table:'sp_comments'},function(){
          if(spAdminTab==='stats'||spAdminTab==='mod')spRenderAdminTab(spAdminTab);
        })
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'sp_likes'},function(){
          if(spAdminTab==='stats')spRenderAdminTab('stats');
        })
        .on('postgres_changes',{event:'DELETE',schema:'public',table:'sp_likes'},function(){
          if(spAdminTab==='stats')spRenderAdminTab('stats');
        })
        .subscribe(function(status){spSetRTDot(status==='SUBSCRIBED');});
    }catch(e){}
  }
}

/* ── Render Tab ──────────────────────────────── */
async function spRenderAdminTab(tab){
  var body=document.getElementById('sp-ap-body');if(!body)return;
  body.innerHTML='<div class="sp-ap-loading"><div class="sp-spin-sm"></div></div>';
  if(tab==='stats')await spTabStats(body);
  else if(tab==='mod')await spTabMod(body);
  else if(tab==='notif')await spTabNotif(body);
  else if(tab==='license')await spTabLicense(body);
  else if(tab==='settings')spTabSettings(body);
}

/* ── Tab: Statistik ──────────────────────────── */
async function spTabStats(body){
  var totalCmt=0,totalLikes=0,todayCmt=0,uniqueUsers=0;
  var topReleases=[],anonCount=0,namedCount=0,weekData=[];
  try{
    var cr=await spSb.from('sp_comments').select('id',{count:'exact',head:true});
    totalCmt=cr.count||0;
    var lr=await spSb.from('sp_likes').select('user_id',{count:'exact',head:true});
    totalLikes=lr.count||0;
    var today=new Date();today.setHours(0,0,0,0);
    var tr=await spSb.from('sp_comments').select('id',{count:'exact',head:true}).gte('created_at',today.toISOString());
    todayCmt=tr.count||0;

    // Unique users
    var ur=await spSb.from('sp_comments').select('user_id');
    if(ur.data){var uids=new Set(ur.data.map(function(d){return d.user_id;}));uniqueUsers=uids.size;}

    // Anon vs named
    var anon=await spSb.from('sp_comments').select('id',{count:'exact',head:true}).eq('is_anonymous',true);
    anonCount=anon.count||0;namedCount=Math.max(0,totalCmt-anonCount);

    // Top releases by comment count
    var allCmt=await spSb.from('sp_comments').select('release_tag').limit(500);
    if(allCmt.data){
      var tagMap={};allCmt.data.forEach(function(d){if(d.release_tag){tagMap[d.release_tag]=(tagMap[d.release_tag]||0)+1;}});
      topReleases=Object.keys(tagMap).map(function(k){return{tag:k,count:tagMap[k]};}).sort(function(a,b){return b.count-a.count;}).slice(0,5);
    }

    // Last 7 days activity
    var sevenDaysAgo=new Date(Date.now()-6*86400000);sevenDaysAgo.setHours(0,0,0,0);
    var weekCmt=await spSb.from('sp_comments').select('created_at').gte('created_at',sevenDaysAgo.toISOString());
    if(weekCmt.data){
      var dayMap={};
      for(var i=6;i>=0;i--){var d=new Date(Date.now()-i*86400000);var k=d.toISOString().slice(0,10);dayMap[k]=0;}
      weekCmt.data.forEach(function(d){var k=(d.created_at||'').slice(0,10);if(k in dayMap)dayMap[k]++;});
      weekData=Object.keys(dayMap).map(function(k){return{date:k,count:dayMap[k]};});
    }
  }catch(e){}

  var maxWeek=Math.max.apply(null,[1].concat(weekData.map(function(d){return d.count;})));
  var maxRelease=topReleases.length?topReleases[0].count:1;
  var anonPct=totalCmt?Math.round(anonCount/totalCmt*100):0;
  var namedPct=100-anonPct;
  var days=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  var html='<div class="sp-ap-stats-grid4">'
    +'<div class="sp-ap-stat sp-stat-blue"><div class="sp-ap-stat-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="sp-ap-stat-num">'+totalCmt+'</div><div class="sp-ap-stat-lbl">Komentar</div></div>'
    +'<div class="sp-ap-stat sp-stat-red"><div class="sp-ap-stat-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="sp-ap-stat-num">'+totalLikes+'</div><div class="sp-ap-stat-lbl">Likes</div></div>'
    +'<div class="sp-ap-stat sp-stat-green"><div class="sp-ap-stat-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="sp-ap-stat-num">'+todayCmt+'</div><div class="sp-ap-stat-lbl">Hari Ini</div></div>'
    +'<div class="sp-ap-stat sp-stat-purple"><div class="sp-ap-stat-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="sp-ap-stat-num">'+uniqueUsers+'</div><div class="sp-ap-stat-lbl">Pengguna Unik</div></div>'
    +'</div>';

  // 7-day sparkline
  if(weekData.length){
    html+='<div class="sp-ap-section-title" style="margin-top:.9rem;margin-bottom:.5rem">Aktivitas 7 Hari</div>';
    html+='<div class="sp-ap-sparkline">';
    weekData.forEach(function(d){
      var pct=maxWeek>0?Math.max(8,Math.round(d.count/maxWeek*100)):8;
      var dayName=days[new Date(d.date+'T12:00:00').getDay()];
      html+='<div class="sp-spark-col"><div class="sp-spark-bar" style="height:'+pct+'%" title="'+d.date+': '+d.count+' komentar"></div><div class="sp-spark-lbl">'+dayName+'</div><div class="sp-spark-num">'+d.count+'</div></div>';
    });
    html+='</div>';
  }

  // Anon vs Named ratio
  if(totalCmt>0){
    html+='<div class="sp-ap-section-title" style="margin-top:.9rem;margin-bottom:.5rem">Anonim vs Bernama</div>';
    html+='<div class="sp-ap-ratio-wrap">'
      +'<div class="sp-ap-ratio-bar"><div class="sp-ap-ratio-fill sp-ratio-anon" style="width:'+anonPct+'%"></div><div class="sp-ap-ratio-fill sp-ratio-named" style="width:'+namedPct+'%"></div></div>'
      +'<div class="sp-ap-ratio-legend"><span class="sp-ratio-dot sp-ratio-anon-dot"></span><span>Anonim '+anonCount+' ('+anonPct+'%)</span><span class="sp-ratio-dot sp-ratio-named-dot" style="margin-left:.6rem"></span><span>Bernama '+namedCount+' ('+namedPct+'%)</span></div>'
      +'</div>';
  }

  // Top releases
  if(topReleases.length){
    html+='<div class="sp-ap-section-title" style="margin-top:.9rem;margin-bottom:.5rem">Top Rilis</div><div class="sp-ap-bar-list">';
    topReleases.forEach(function(r){
      var pct=Math.round(r.count/maxRelease*100);
      html+='<div class="sp-ap-bar-item"><div class="sp-ap-bar-tag">'+spEsc(r.tag)+'</div><div class="sp-ap-bar-track"><div class="sp-ap-bar-fill" style="width:'+pct+'%"></div></div><div class="sp-ap-bar-val">'+r.count+'</div></div>';
    });
    html+='</div>';
  }

  // Recent comments
  html+='<div class="sp-ap-section-title" style="margin-top:.9rem;display:flex;align-items:center;justify-content:space-between"><span>Komentar Terbaru</span>'
    +'<button class="sp-ap-btn-ghost sp-ap-btn-xs ripple-btn" id="sp-stats-export-btn"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Export CSV</button>'
    +'</div><div class="sp-ap-recent-list" id="sp-ap-recent"></div>';

  body.innerHTML=html;

  document.getElementById('sp-stats-export-btn').addEventListener('click',function(){spExportCSV(null);});

  try{
    var rr=await spSb.from('sp_comments').select('*').order('created_at',{ascending:false}).limit(8);
    var list=document.getElementById('sp-ap-recent');if(!list)return;
    if(!rr.data||!rr.data.length){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar.</p>';return;}
    rr.data.forEach(function(d){
      var item=document.createElement('div');item.className='sp-ap-rcmt';
      item.innerHTML='<div class="sp-ap-rcmt-meta"><span class="sp-ap-rcmt-name">'+(d.is_anonymous?'Anonim':spEsc(d.display_name||'User'))+'</span><span class="sp-ap-rcmt-tag">'+spEsc(d.release_tag||'')+'</span><span class="sp-ap-rcmt-time">'+spRelTime(d.created_at)+'</span></div>'
        +'<div class="sp-ap-rcmt-text">'+spEsc(d.text)+'</div>'
        +'<button class="sp-ap-del-btn ripple-btn" data-id="'+spEsc(d.id||'')+'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Hapus</button>';
      list.appendChild(item);
    });
  }catch(e){var l=document.getElementById('sp-ap-recent');if(l)l.innerHTML='<p class="sp-no-cmt sp-cmt-err">Gagal memuat.</p>';}
}

/* ── Tab: Moderasi ───────────────────────────── */
async function spTabMod(body){
  var sortAsc=false;
  body.innerHTML='<div class="sp-ap-mod-toolbar">'
    +'<input class="sp-ap-search" id="sp-mod-search" type="search" placeholder="Cari komentar atau tag rilis..." autocomplete="off"/>'
    +'<button class="sp-ap-btn-ghost sp-ap-btn-xs ripple-btn" id="sp-mod-sort-btn" title="Urutkan"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Terlama</button>'
    +'<button class="sp-ap-bulk-del ripple-btn" id="sp-mod-bulkdel" style="display:none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Hapus (<span id="sp-sel-count">0</span>)</button>'
    +'<button class="sp-ap-btn-ghost sp-ap-btn-xs ripple-btn" id="sp-mod-export-btn"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> CSV</button>'
    +'</div><div class="sp-ap-mod-list" id="sp-mod-list"><div class="sp-ap-loading"><div class="sp-spin-sm"></div></div></div>';

  await spLoadModList('',false);

  var searchEl=document.getElementById('sp-mod-search');
  if(searchEl){var dbt;searchEl.addEventListener('input',function(){clearTimeout(dbt);dbt=setTimeout(function(){spLoadModList(searchEl.value.trim(),sortAsc);},300);});}

  var sortBtn=document.getElementById('sp-mod-sort-btn');
  if(sortBtn)sortBtn.addEventListener('click',function(){
    sortAsc=!sortAsc;
    sortBtn.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> '+(sortAsc?'Terlama':'Terbaru');
    var q=searchEl?searchEl.value.trim():'';
    spLoadModList(q,sortAsc);
  });

  var expBtn=document.getElementById('sp-mod-export-btn');
  if(expBtn)expBtn.addEventListener('click',function(){spExportCSV(null);});
}

async function spLoadModList(q,asc){
  var list=document.getElementById('sp-mod-list');if(!list)return;
  list.innerHTML='<div class="sp-ap-loading"><div class="sp-spin-sm"></div></div>';
  try{
    var query=spSb.from('sp_comments').select('*').order('created_at',{ascending:!!asc}).limit(50);
    if(q)query=query.or('display_name.ilike.%'+q+'%,text.ilike.%'+q+'%,release_tag.ilike.%'+q+'%');
    var r=await query;if(r.error)throw r.error;
    list.innerHTML='';
    if(!r.data||!r.data.length){list.innerHTML='<p class="sp-no-cmt">Tidak ada komentar ditemukan.</p>';return;}
    var selIds=[];
    r.data.forEach(function(d){
      var item=document.createElement('div');item.className='sp-ap-mitem';item.dataset.id=d.id;
      item.innerHTML='<label class="sp-ap-chk-wrap"><input type="checkbox" class="sp-ap-chk" data-id="'+spEsc(d.id)+'"/></label>'
        +'<div class="sp-ap-mitem-body">'
        +'<div class="sp-ap-mitem-meta"><span class="sp-ap-rcmt-name">'+(d.is_anonymous?'\ud83d\udc64 Anonim':spEsc(d.display_name||'User'))+'</span><span class="sp-ap-rcmt-tag">'+spEsc(d.release_tag||'')+'</span><span class="sp-ap-rcmt-time">'+spRelTime(d.created_at)+'</span></div>'
        +'<div class="sp-ap-mitem-text">'+spEsc(d.text)+'</div>'
        +'</div>'
        +'<div class="sp-ap-mitem-actions">'
        +'<button class="sp-ap-reply-btn ripple-btn" data-tag="'+spEsc(d.release_tag||'')+'" data-ref="'+spEsc(d.text.slice(0,40))+'" title="Balas sebagai Owner"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 17l-5-5 5-5M4 12h11a4 4 0 010 8h-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
        +'<button class="sp-ap-del-btn ripple-btn" data-id="'+spEsc(d.id||'')+'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
        +'</div>';
      list.appendChild(item);
    });

    // Reply handler
    list.addEventListener('click',function(e){
      var rb=e.target.closest('.sp-ap-reply-btn');
      if(rb){spShowReplyModal(rb.dataset.tag,rb.dataset.ref);return;}
    });

    list.addEventListener('change',function(e){
      var chk=e.target.closest('.sp-ap-chk');if(!chk)return;
      var id=chk.dataset.id;
      if(chk.checked){if(selIds.indexOf(id)===-1)selIds.push(id);}else{selIds=selIds.filter(function(x){return x!==id;});}
      var bd=document.getElementById('sp-mod-bulkdel');var sc=document.getElementById('sp-sel-count');
      if(bd)bd.style.display=selIds.length?'inline-flex':'none';
      if(sc)sc.textContent=selIds.length;
    });
    var bd=document.getElementById('sp-mod-bulkdel');
    if(bd)bd.addEventListener('click',async function(){
      if(!selIds.length)return;if(!confirm('Hapus '+selIds.length+' komentar yang dipilih?'))return;
      for(var i=0;i<selIds.length;i++){try{await spSb.from('sp_comments').delete().eq('id',selIds[i]);}catch(e){}}
      spShowToast('\u2713 '+selIds.length+' komentar dihapus',true);selIds=[];spLoadModList(q,asc);
    });
  }catch(e){list.innerHTML='<p class="sp-no-cmt sp-cmt-err">Gagal memuat.</p>';}
}

function spShowReplyModal(tag,refText){
  if(document.getElementById('sp-reply-modal'))return;
  var m=document.createElement('div');m.id='sp-reply-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card"><button class="sp-auth-x" id="sp-reply-x">\u00d7</button>'
    +'<div class="sp-auth-ico" style="background:rgba(59,143,255,.12);border-color:rgba(59,143,255,.3)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 17l-5-5 5-5M4 12h11a4 4 0 010 8h-1" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Balas sebagai Owner</h3>'
    +(refText?'<p class="sp-auth-sub" style="font-style:italic;color:var(--text3)">"\u2026'+spEsc(refText)+(refText.length>=40?'\u2026':'')+'"</p>':'')
    +'<div class="sp-name-form"><textarea class="sp-ap-textarea" id="sp-reply-inp" rows="3" placeholder="Tulis balasan..." maxlength="500" style="width:100%;box-sizing:border-box"></textarea></div>'
    +'<div class="sp-ap-actions" style="margin-top:.5rem"><button class="sp-ap-btn-primary ripple-btn" id="sp-reply-ok">Kirim Balasan</button></div>'
    +'<div class="sp-owner-status" id="sp-reply-st"></div></div>';
  document.body.appendChild(m);requestAnimationFrame(function(){m.classList.add('sp-auth-open');});
  var inp=document.getElementById('sp-reply-inp');
  setTimeout(function(){if(inp)inp.focus();},200);
  document.getElementById('sp-reply-x').addEventListener('click',function(){spCloseModal('sp-reply-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-reply-modal');});
  document.getElementById('sp-reply-ok').addEventListener('click',async function(){
    var txt=inp?inp.value.trim():'';if(!txt)return;
    var st=document.getElementById('sp-reply-st');if(st){st.className='sp-owner-status sp-own-checking';st.textContent='Mengirim...';}
    try{
      var payload={release_tag:tag,user_id:'owner_'+SP_OWN_GH,display_name:'\ud83d\udc51 '+spOwner.name,avatar_url:spOwner.avatar||'',text:txt,is_anonymous:false};
      var ins=await spSb.from('sp_comments').insert(payload).select();
      if(ins.error)throw ins.error;
      spCloseModal('sp-reply-modal');spShowToast('\u2713 Balasan dikirim!',true);
    }catch(e){if(st){st.className='sp-owner-status sp-own-err';st.textContent='\u2717 Gagal: '+(e.message||'');}}
  });
}

/* ── CSV Export ──────────────────────────────── */
async function spExportCSV(tag){
  if(!spSb){spShowToast('\u2717 Supabase tidak tersambung',false);return;}
  try{
    var q=spSb.from('sp_comments').select('*').order('created_at',{ascending:false}).limit(1000);
    if(tag)q=q.eq('release_tag',tag);
    var r=await q;if(r.error)throw r.error;
    if(!r.data||!r.data.length){spShowToast('Tidak ada komentar untuk diekspor',false);return;}
    var cols=['id','release_tag','display_name','is_anonymous','text','created_at','user_id'];
    var lines=[cols.join(',')];
    r.data.forEach(function(d){
      lines.push(cols.map(function(k){
        var v=d[k]===null||d[k]===undefined?'':String(d[k]);
        if(v.indexOf(',')>-1||v.indexOf('"')>-1||v.indexOf('\n')>-1)v='"'+v.replace(/"/g,'""')+'"';
        return v;
      }).join(','));
    });
    var blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='snapperf_comments_'+(tag||'all')+'_'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    spShowToast('\u2713 CSV diekspor ('+r.data.length+' baris)',true);
  }catch(e){spShowToast('\u2717 Export gagal: '+(e.message||''),false);}
}

/* ── Tab: Notifikasi ─────────────────────────── */
async function spTabNotif(body){
  var curMsg='',curType='info',curActive=false;
  body.innerHTML='<div class="sp-ap-loading"><div class="sp-spin-sm"></div></div>';
  try{
    var r=await fetch(SP_GH_NOTIF_PATH,{headers:{'Authorization':'Bearer '+spOwner.token,'Accept':'application/vnd.github.v3+json'}});
    if(r.ok){var d=await r.json();var content=JSON.parse(atob(d.content.replace(/\n/g,'')));curMsg=content.message||'';curType=content.type||'info';curActive=!!content.active;}
  }catch(e){}
  var typeOpts=['info','success','warning','alert'].map(function(t){return'<option value="'+t+'"'+(t===curType?' selected':'')+'>'+t.charAt(0).toUpperCase()+t.slice(1)+'</option>';}).join('');
  body.innerHTML='<div class="sp-ap-section-title">Pengumuman Sitewide</div>'
    +'<p class="sp-ap-hint">Pesan ini akan muncul sebagai banner di semua halaman website.</p>'
    +'<div class="sp-ap-form">'
    +'<label class="sp-ap-label">Pesan</label>'
    +'<textarea class="sp-ap-textarea" id="sp-notif-msg" placeholder="Tulis pesan pengumuman..." rows="3">'+spEsc(curMsg)+'</textarea>'
    +'<label class="sp-ap-label">Tipe</label>'
    +'<select class="sp-ap-select" id="sp-notif-type">'+typeOpts+'</select>'
    +'<div class="sp-ap-toggle-row"><span>Status Aktif</span><label class="sp-ap-toggle"><input type="checkbox" id="sp-notif-active"'+(curActive?' checked':'')+'"/><span class="sp-ap-toggle-slider"></span></label></div>'
    +'<div class="sp-ap-actions">'
    +'<button class="sp-ap-btn-primary ripple-btn" id="sp-notif-send">Kirim Pengumuman</button>'
    +'<button class="sp-ap-btn-ghost ripple-btn" id="sp-notif-clear">Nonaktifkan</button>'
    +'</div>'
    +'<div class="sp-owner-status" id="sp-notif-st"></div>'
    +'</div>';

  async function pushNotif(msg,type,active){
    var st=document.getElementById('sp-notif-st');if(st){st.className='sp-owner-status sp-own-checking';st.textContent='Mengirim...';}
    try{
      var getR=await fetch(SP_GH_NOTIF_PATH,{headers:{'Authorization':'Bearer '+spOwner.token,'Accept':'application/vnd.github.v3+json'}});
      if(!getR.ok)throw new Error('Gagal ambil file');var gd=await getR.json();var sha=gd.sha;
      var payload={active:active,id:active?'notif_'+Date.now():'notif_default',type:type||'info',message:msg,timestamp:Date.now()};
      var encoded=btoa(unescape(encodeURIComponent(JSON.stringify(payload,null,2))));
      var putR=await fetch(SP_GH_NOTIF_PATH,{method:'PUT',headers:{'Authorization':'Bearer '+spOwner.token,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},body:JSON.stringify({message:active?'Push notification [skip ci]':'Clear notification [skip ci]',content:encoded,sha:sha})});
      if(!putR.ok)throw new Error('Gagal update');
      if(st){st.className='sp-owner-status';st.textContent='\u2713 Berhasil! Perubahan aktif dalam ~30 detik.';}
      spShowToast('\u2713 Pengumuman berhasil dikirim',true);
    }catch(e){if(st){st.className='sp-owner-status sp-own-err';st.textContent='\u2717 '+(e.message||'Error');}spShowToast('\u2717 Gagal kirim pengumuman',false);}
  }
  document.getElementById('sp-notif-send').addEventListener('click',function(){
    var msg=document.getElementById('sp-notif-msg').value.trim();
    var type=document.getElementById('sp-notif-type').value;
    var active=document.getElementById('sp-notif-active').checked;
    if(!msg){spShowToast('Pesan tidak boleh kosong',false);return;}pushNotif(msg,type,active);
  });
  document.getElementById('sp-notif-clear').addEventListener('click',function(){pushNotif('',null,false);});
}

/* ── Tab: Lisensi ────────────────────────────── */
async function spTabLicense(body){
  body.innerHTML='<div class="sp-ap-loading"><div class="sp-spin-sm"></div><span>Memuat info lisensi...</span></div>';
  var now=Date.now();
  var tokenSaved=parseInt(localStorage.getItem(SP_TOKEN_SAVED_KEY)||'0',10);
  var firstLogin=parseInt(localStorage.getItem(SP_FIRST_LOGIN_KEY)||tokenSaved||'0',10);
  var meta=spLoadTokenMeta();
  var sbJwt=spDecodeJWT(SP_SB_ANON);
  var sbExpMs=sbJwt&&sbJwt.exp?(sbJwt.exp*1000):null;
  var sbIatMs=sbJwt&&sbJwt.iat?(sbJwt.iat*1000):null;

  // Refresh GitHub rate limit info
  var freshMeta=null;
  try{
    var chkR=await fetch('https://api.github.com/rate_limit',{headers:{'Authorization':'Bearer '+spOwner.token,'Accept':'application/vnd.github.v3+json'}});
    if(chkR.ok){
      var chkD=await chkR.json();
      var core=chkD.resources&&chkD.resources.core;
      if(core){
        freshMeta={rateRemain:core.remaining,rateLimit:core.limit,rateReset:core.reset*1000,verifiedAt:now,expiry:meta?meta.expiry:null};
        spSaveTokenMeta(freshMeta);meta=freshMeta;
      }
    }
  }catch(e){}

  // Supabase row counts
  var sbCmtCount=0,sbLikeCount=0,sbConnected=false;
  try{
    var sc=await spSb.from('sp_comments').select('id',{count:'exact',head:true});
    var sl=await spSb.from('sp_likes').select('user_id',{count:'exact',head:true});
    sbCmtCount=sc.count||0;sbLikeCount=sl.count||0;sbConnected=true;
  }catch(e){}

  function statusBadge(ok,yes,no){return'<span class="sp-ap-status-badge '+(ok?'sp-badge-ok':'sp-badge-err')+'">'+(ok?yes:no)+'</span>';}
  function infoRow(label,val,extra){return'<div class="sp-ap-info-row"><span class="sp-ap-info-lbl">'+label+'</span><span class="sp-ap-info-val">'+(val||'—')+(extra?'<span class="sp-ap-info-extra">'+extra+'</span>':'')+'</span></div>';}

  var tokenExpiryHtml='—';
  if(meta&&meta.expiry){
    var exMs=new Date(meta.expiry).getTime();var exLeft=exMs-now;
    var exStr=new Date(meta.expiry).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
    if(exLeft<0){tokenExpiryHtml='<span style="color:#ff375f">\u2717 Kadaluarsa</span>';}
    else if(exLeft<7*86400000){tokenExpiryHtml='<span style="color:#ff9f0a">\u26a0 '+exStr+' ('+Math.ceil(exLeft/86400000)+' hari lagi)</span>';}
    else{tokenExpiryHtml='<span style="color:#00c787">\u2713 '+exStr+' ('+Math.ceil(exLeft/86400000)+' hari lagi)</span>';}
  } else {
    tokenExpiryHtml='<span style="color:var(--text3)">Tidak ada batas (no expiry)</span>';
  }

  var ratePct=meta?(Math.round(meta.rateRemain/meta.rateLimit*100)):100;
  var rateColor=ratePct>50?'#00c787':ratePct>20?'#ff9f0a':'#ff375f';
  var rateResetStr=meta&&meta.rateReset?new Date(meta.rateReset).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):null;

  var sbExpStr=sbExpMs?new Date(sbExpMs).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}):null;
  var sbExpLeft=sbExpMs?(sbExpMs-now):null;
  var sbExpHtml=sbExpStr?('<span style="color:'+(sbExpLeft>30*86400000?'#00c787':sbExpLeft>0?'#ff9f0a':'#ff375f')+'">'+sbExpStr+' ('+(sbExpLeft>0?Math.ceil(sbExpLeft/86400000)+' hari lagi':'Kadaluarsa!')+')</span>'):'—';

  var ghAccAge='';
  if(spOwner.ghCreatedAt){
    var ghMs=new Date(spOwner.ghCreatedAt).getTime();
    ghAccAge=spFmtDuration(now-ghMs);
  }

  var html='';

  // Token section
  html+='<div class="sp-ap-section-title">GitHub Token</div>'
    +'<div class="sp-ap-license-card">'
    +infoRow('Status',statusBadge(true,'Aktif','Tidak Aktif'))
    +infoRow('Login Pertama',firstLogin?spFullDate(firstLogin)+'':'—',firstLogin?'('+spFmtDuration(now-firstLogin)+' lalu)':'')
    +infoRow('Token Disimpan',tokenSaved?spFullDate(tokenSaved):firstLogin?spFullDate(firstLogin):'—',tokenSaved?'('+spFmtDuration(now-tokenSaved)+' lalu)':'')
    +infoRow('Token Kadaluarsa',tokenExpiryHtml)
    +'<div class="sp-ap-info-row"><span class="sp-ap-info-lbl">Rate Limit API</span><span class="sp-ap-info-val">'+(meta?meta.rateRemain+' / '+meta.rateLimit:'—')+(rateResetStr?'<span class="sp-ap-info-extra">Reset '+rateResetStr+'</span>':'')+'</span></div>'
    +(meta?'<div class="sp-ap-progress-wrap"><div class="sp-ap-progress-bar" style="width:'+ratePct+'%;background:'+rateColor+'"></div></div>':'')
    +'</div>';

  // GitHub account
  html+='<div class="sp-ap-section-title" style="margin-top:1rem">GitHub Account</div>'
    +'<div class="sp-ap-license-card">'
    +(spOwner.avatar?'<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.7rem"><img src="'+spEsc(spOwner.avatar)+'" style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,159,10,.35)" alt=""/><div><div style="font-weight:800;font-size:.9rem">'+spEsc(spOwner.name)+'</div>'+(spOwner.bio?'<div style="font-size:.74rem;color:var(--text3)">'+spEsc(spOwner.bio)+'</div>':'')+'</div></div>':'')
    +infoRow('Login',('@'+spOwner.login))
    +infoRow('Followers',spOwner.followers!==undefined?spOwner.followers.toLocaleString():'—')
    +infoRow('Public Repos',spOwner.publicRepos!==undefined?spOwner.publicRepos.toLocaleString():'—')
    +infoRow('Umur Akun',ghAccAge||'—')
    +'</div>';

  // Supabase
  html+='<div class="sp-ap-section-title" style="margin-top:1rem">Supabase</div>'
    +'<div class="sp-ap-license-card">'
    +infoRow('Koneksi',statusBadge(sbConnected,'Terhubung','Terputus'))
    +infoRow('Project ID','<code>'+spEsc(SP_SB_URL.replace('https://','').split('.')[0])+'</code>')
    +infoRow('Anon Key Dibuat',sbIatMs?new Date(sbIatMs).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}):'—')
    +infoRow('Anon Key Kadaluarsa',sbExpHtml)
    +infoRow('Total Rows Komentar',sbCmtCount.toLocaleString())
    +infoRow('Total Rows Likes',sbLikeCount.toLocaleString())
    +'<div class="sp-ap-hint" style="margin-top:.4rem;font-size:.69rem">Free tier Supabase: 500MB DB, 2 juta row reads/bulan, 50K row inserts/bulan.</div>'
    +'</div>';

  // Session
  html+='<div class="sp-ap-section-title" style="margin-top:1rem">Sesi Ini</div>'
    +'<div class="sp-ap-license-card">'
    +infoRow('Realtime',statusBadge(spRTConnected,'Terhubung','Terputus'))
    +infoRow('Supabase RT',sbConnected?statusBadge(true,'Online','Offline'):statusBadge(false,'Online','Offline'))
    +infoRow('Terakhir Verifikasi',meta&&meta.verifiedAt?spRelTime(meta.verifiedAt):'—')
    +'<div class="sp-ap-actions" style="margin-top:.6rem">'
    +'<button class="sp-ap-btn-ghost ripple-btn" id="sp-lic-refresh"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Refresh Info</button>'
    +'</div>'
    +'</div>';

  body.innerHTML=html;

  document.getElementById('sp-lic-refresh').addEventListener('click',function(){spRenderAdminTab('license');});
}

/* ── Tab: Pengaturan ─────────────────────────── */
function spTabSettings(body){
  var token=spLoadToken();
  body.innerHTML='<div class="sp-ap-section-title">Pengaturan Owner</div>'
    +'<div class="sp-ap-form">'
    +'<div class="sp-ap-owner-info"><div class="sp-ap-owner-row">'+(spOwner.avatar?'<img class="sp-ap-av" src="'+spEsc(spOwner.avatar)+'" alt=""/>':'')+'<div><div class="sp-ap-name">'+spEsc(spOwner.name)+'</div><div class="sp-ap-role">@'+spEsc(spOwner.login||SP_OWN_GH)+'</div></div></div></div>'
    +'<label class="sp-ap-label">GitHub Token</label>'
    +'<div class="sp-token-wrap"><input class="sp-name-input" id="sp-set-token" type="password" value="'+spEsc(token)+'" autocomplete="off" spellcheck="false"/><button class="sp-eye-btn" id="sp-set-eye" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg></button></div>'
    +'<div class="sp-ap-actions"><button class="sp-ap-btn-primary ripple-btn" id="sp-set-save">Simpan Token Baru</button><button class="sp-ap-btn-danger ripple-btn" id="sp-set-logout">Logout Owner</button></div>'
    +'<div class="sp-owner-status" id="sp-set-st"></div>'
    +'</div>'
    +'<div class="sp-ap-section-title" style="margin-top:1.2rem">Database Supabase</div>'
    +'<div class="sp-ap-form">'
    +'<div class="sp-ap-hint">Project: <code>'+spEsc(SP_SB_URL.replace('https://','').split('.')[0])+'</code></div>'
    +'<div class="sp-ap-actions">'
    +'<button class="sp-ap-btn-ghost ripple-btn" id="sp-export-all-btn"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Export Semua (CSV)</button>'
    +'<button class="sp-ap-btn-ghost ripple-btn" id="sp-del-all-likes">Hapus Semua Likes</button>'
    +'<button class="sp-ap-btn-danger ripple-btn" id="sp-del-all-cmt">Hapus Semua Komentar</button>'
    +'</div>'
    +'</div>'
    +'<div class="sp-ap-section-title" style="margin-top:1.2rem">Data Lokal</div>'
    +'<div class="sp-ap-form">'
    +'<div class="sp-ap-hint">Data pengguna yang tersimpan di browser.</div>'
    +'<div class="sp-ap-actions">'
    +'<button class="sp-ap-btn-ghost ripple-btn" id="sp-clear-anon">Hapus ID Anonim Saya</button>'
    +'</div>'
    +'</div>';

  var eye=document.getElementById('sp-set-eye');var inp=document.getElementById('sp-set-token');
  if(eye&&inp)eye.addEventListener('click',function(){var show=inp.type==='password';inp.type=show?'text':'password';});
  document.getElementById('sp-set-save').addEventListener('click',async function(){
    var t=inp?inp.value.trim():'';if(!t)return;
    var st=document.getElementById('sp-set-st');if(st){st.className='sp-owner-status sp-own-checking';st.textContent='Memverifikasi...';}
    var data=await spVerifyToken(t);
    if(data){spSaveToken(t);spSaveOwnerData(data);spOwner.token=t;if(st){st.className='sp-owner-status';st.textContent='\u2713 Token valid dan tersimpan.';}}
    else{if(st){st.className='sp-owner-status sp-own-err';st.textContent='\u2717 Token tidak valid.';}}
  });
  document.getElementById('sp-set-logout').addEventListener('click',function(){
    if(!confirm('Logout dari mode owner?'))return;
    spClearToken();spOwner=null;spRemoveAdminNav();spUpdateAllBars();
    var panel=document.getElementById('sp-admin-panel');if(panel){panel.classList.remove('sp-panel-open');setTimeout(function(){panel.remove();},320);}
    spShowToast('Logout owner berhasil',true);
  });
  document.getElementById('sp-export-all-btn').addEventListener('click',function(){spExportCSV(null);});
  document.getElementById('sp-del-all-likes').addEventListener('click',async function(){
    if(!confirm('Hapus SEMUA likes dari database?'))return;
    try{await spSb.from('sp_likes').delete().neq('user_id','__none__');spShowToast('\u2713 Semua likes dihapus',true);}
    catch(e){spShowToast('\u2717 Gagal: '+(e.message||''),false);}
  });
  document.getElementById('sp-del-all-cmt').addEventListener('click',async function(){
    if(!confirm('HAPUS SEMUA komentar? Tindakan ini tidak bisa dibatalkan!'))return;
    if(!confirm('Yakin benar-benar?'))return;
    try{await spSb.from('sp_comments').delete().neq('id','00000000-0000-0000-0000-000000000000');spShowToast('\u2713 Semua komentar dihapus',true);spRenderAdminTab('settings');}
    catch(e){spShowToast('\u2717 Gagal: '+(e.message||''),false);}
  });
  document.getElementById('sp-clear-anon').addEventListener('click',function(){
    localStorage.removeItem('sp-anon-id');spAnonId=null;spShowToast('\u2713 ID anonim dihapus',true);
  });
}

/* ── Delete Comment ──────────────────────────── */
async function spDeleteComment(id,el){
  if(!spSb||!id)return;if(!confirm('Hapus komentar ini?'))return;
  try{
    var r=await spSb.from('sp_comments').delete().eq('id',id);if(r.error)throw r.error;
    if(el){el.style.transition='opacity .22s,transform .22s';el.style.opacity='0';el.style.transform='translateX(12px)';setTimeout(function(){var list=el.parentNode;el.remove();if(list&&!list.querySelector('.sp-cmt-item,.sp-ap-mitem,.sp-ap-rcmt'))list.innerHTML='<p class="sp-no-cmt">Tidak ada komentar.</p>';},240);}
    var bar=el&&el.closest('.sp-engage-bar-wrap')&&el.closest('.sp-engage-bar-wrap').querySelector('.sp-engage-bar');
    if(bar)spRefreshEngagement(bar.dataset.tag,bar);
    spShowToast('\u2713 Komentar dihapus',true);
  }catch(e){spShowToast('\u2717 Gagal: '+(e.message||''),false);}
}

/* ── Comment Element ─────────────────────────── */
function spMakeCmtEl(d,isOpt){
  var ts=d.created_at||new Date().toISOString();var rel=spRelTime(ts);var full=spFullDate(ts);
  var isAnon=!!d.is_anonymous;var name=isAnon?'Anonim':spEsc(d.display_name||'User');
  var ini=(isAnon?'?':(d.display_name||'?')).charAt(0).toUpperCase();
  var av=isAnon?'<div class="sp-cmt-av sp-cmt-av-fallback sp-cmt-anon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>':'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc(ini)+'</div>';
  var isOwnerReply=d.user_id&&d.user_id.startsWith('owner_');
  var delBtn=spOwner?'<button class="sp-cmt-delete ripple-btn" data-id="'+spEsc(d.id||'')+'" title="Hapus"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>':'';
  var el=document.createElement('div');
  el.className='sp-cmt-item'+(isOpt?' sp-cmt-optimistic':'')+(isOwnerReply?' sp-cmt-owner-reply':'');
  if(d.id)el.dataset.cmtId=d.id;
  el.innerHTML=av+'<div class="sp-cmt-body"><div class="sp-cmt-meta"><span class="sp-cmt-name'+(isAnon?' sp-cmt-anon-name':'')+(isOwnerReply?' sp-cmt-owner-name':'')+'">'+name+(isOwnerReply?' 👑':'')+'</span><span class="sp-cmt-time" data-ts="'+spEsc(ts)+'" title="'+full+'">'+rel+'</span>'+delBtn+'</div><span class="sp-cmt-text">'+spEsc(d.text)+'</span></div>';
  return el;
}

/* ── Engagement ──────────────────────────────── */
async function spRefreshEngagement(tag,bar){
  if(!tag||!bar||!spSb)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  try{var lr=await spSb.from('sp_likes').select('user_id').eq('release_tag',tag);if(lr.error)throw lr.error;var rows=lr.data||[];var liked=rows.some(function(r){return r.user_id===uid;});var lb=bar.querySelector('.sp-like-btn');var lc=bar.querySelector('.sp-like-count');if(lb)lb.classList.toggle('sp-liked',liked);if(lc)lc.textContent=rows.length>0?rows.length:'';}catch(e){}
  try{var cr=await spSb.from('sp_comments').select('id',{count:'exact',head:true}).eq('release_tag',tag);if(!cr.error){var cc=bar.querySelector('.sp-comment-count');if(cc)cc.textContent=cr.count||0;}}catch(e){}
}
window.spLoadEngagement=spRefreshEngagement;

function spSubscribeComments(tag,section){
  if(!spSb||!tag||spChannels[tag])return;
  var list=section.querySelector('.sp-cmt-list');
  try{
    var ch=spSb.channel('cmt_'+tag)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'sp_comments',filter:'release_tag=eq.'+tag},function(pl){
        var d=pl.new;if(!d||!d.text)return;
        var uid=spUser?spUser.uid:spGetAnonId();
        var opts=list?list.querySelectorAll('.sp-cmt-optimistic'):[];
        for(var i=0;i<opts.length;i++){var o=opts[i];if(d.user_id===uid&&o.querySelector('.sp-cmt-text')&&o.querySelector('.sp-cmt-text').textContent===d.text){o.classList.remove('sp-cmt-optimistic');o.style.opacity='1';if(d.id){o.dataset.cmtId=d.id;var db=o.querySelector('.sp-cmt-delete');if(db)db.dataset.id=d.id;}var te=o.querySelector('.sp-cmt-time');if(te){te.textContent=spRelTime(d.created_at);te.dataset.ts=d.created_at;te.title=spFullDate(d.created_at);}return;}}
        if(list){var el=spMakeCmtEl(d);el.classList.add('sp-cmt-realtime');list.appendChild(el);list.scrollTop=list.scrollHeight;}
        var wrap=section.closest('.sp-engage-bar-wrap');var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;if(bar)spRefreshEngagement(tag,bar);
      })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'sp_comments',filter:'release_tag=eq.'+tag},function(pl){
        var old=pl.old;if(!old||!old.id)return;
        var el=list?list.querySelector('[data-cmt-id="'+old.id+'"]'):null;
        if(el){el.style.transition='opacity .2s';el.style.opacity='0';setTimeout(function(){if(el.parentNode)el.remove();},220);}
        var wrap=section.closest('.sp-engage-bar-wrap');var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;if(bar)spRefreshEngagement(tag,bar);
      })
      .subscribe();
    spChannels[tag]=ch;
  }catch(e){}
}
function spUnsubscribeComments(tag){if(!spSb||!spChannels[tag])return;try{spSb.removeChannel(spChannels[tag]);}catch(e){}delete spChannels[tag];}

async function spFetchComments(tag,section){
  if(!spSb||!section||!tag)return;
  var list=section.querySelector('.sp-cmt-list');if(!list)return;
  list.innerHTML='<div class="sp-cmt-loading"><div class="sp-spin-sm"></div></div>';
  try{var r=await spSb.from('sp_comments').select('*').eq('release_tag',tag).order('created_at',{ascending:true}).limit(60);if(r.error)throw r.error;list.innerHTML='';if(!r.data||!r.data.length){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';return;}r.data.forEach(function(d){list.appendChild(spMakeCmtEl(d));});list.scrollTop=list.scrollHeight;}
  catch(e){list.innerHTML='<p class="sp-no-cmt sp-cmt-err">Gagal memuat. Cek koneksi.</p>';}
}

async function spSendComment(tag,text,isAnon,section,bar){
  var trimmed=text.trim();if(!trimmed)return;
  var inp=section.querySelector('.sp-cmt-input');var btn=section.querySelector('.sp-cmt-send');var list=section.querySelector('.sp-cmt-list');
  if(btn){btn.disabled=true;btn.textContent='...';}
  var active=spOwner||spUser;
  var uid=isAnon?spGetAnonId():(active?active.uid||('u_'+(active.name||'x').replace(/\W/g,'').slice(0,8)+'_'+spGetAnonId().slice(-6)):spGetAnonId());
  var dname=isAnon?'Anonim':(active?active.name:'Anonim');
  var optData={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||!active,created_at:new Date().toISOString()};
  var emptyEl=list?list.querySelector('.sp-no-cmt'):null;if(emptyEl)emptyEl.remove();
  var optEl=spMakeCmtEl(optData,true);optEl.style.opacity='0.5';
  if(list){list.appendChild(optEl);list.scrollTop=list.scrollHeight;}
  if(inp)inp.value='';if(btn){btn.disabled=false;btn.textContent='Kirim';}
  if(!spSb){optEl.style.opacity='1';optEl.classList.remove('sp-cmt-optimistic');spShowToast('\u2713 Komentar terkirim',true);return;}
  try{
    var payload={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||!active};
    var ins=await spSb.from('sp_comments').insert(payload).select();if(ins.error)throw ins.error;
    var saved=ins.data&&ins.data[0];
    if(saved){if(saved.id){optEl.dataset.cmtId=saved.id;var db=optEl.querySelector('.sp-cmt-delete');if(db)db.dataset.id=saved.id;}if(saved.created_at){var te=optEl.querySelector('.sp-cmt-time');if(te){te.textContent=spRelTime(saved.created_at);te.dataset.ts=saved.created_at;te.title=spFullDate(saved.created_at);}}}
    optEl.style.opacity='1';optEl.classList.remove('sp-cmt-optimistic');
    spShowToast('\u2713 Komentar terkirim!',true);
    await spRefreshEngagement(tag,bar);
    if(!isAnon&&spUser)spSendEmail(tag,spUser.name,trimmed);
  }catch(e){
    optEl.remove();
    var msg=e&&e.message?e.message:'';
    if(msg.indexOf('relation')!==-1||msg.indexOf('does not exist')!==-1)spShowToast('\u2717 Tabel belum dibuat. Jalankan SUPABASE_SETUP.sql',false);
    else if(msg.indexOf('policy')!==-1||msg.indexOf('violates')!==-1)spShowToast('\u2717 RLS policy error. Cek Supabase.',false);
    else spShowToast('\u2717 Gagal kirim: '+(msg.slice(0,60)||'error'),false);
    if(list&&!list.querySelector('.sp-cmt-item'))list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';
  }
}

async function spToggleLike(tag,bar){
  if(!tag||!bar)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  var lb=bar.querySelector('.sp-like-btn');var lc=bar.querySelector('.sp-like-count');
  var wasLiked=lb&&lb.classList.contains('sp-liked');var cur=parseInt((lc?lc.textContent:'')||'0',10)||0;
  if(lb)lb.classList.toggle('sp-liked',!wasLiked);if(lc)lc.textContent=wasLiked?Math.max(0,cur-1)||'':cur+1;
  if(!spSb)return;
  try{var ex=await spSb.from('sp_likes').select('user_id').eq('release_tag',tag).eq('user_id',uid);if(ex.error)throw ex.error;if(ex.data&&ex.data.length>0){var d=await spSb.from('sp_likes').delete().eq('release_tag',tag).eq('user_id',uid);if(d.error)throw d.error;}else{var i=await spSb.from('sp_likes').insert({release_tag:tag,user_id:uid});if(i.error)throw i.error;}await spRefreshEngagement(tag,bar);}
  catch(e){if(lb)lb.classList.toggle('sp-liked',wasLiked);if(lc)lc.textContent=cur||'';}
}

function spSendEmail(tag,name,text){if(typeof emailjs==='undefined')return;try{emailjs.init(SP_EJS_PK);emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{to_email:SP_OWN_EMAIL,commenter_name:name,release_tag:tag,comment_text:text,site_url:'https://aetherdev01.github.io/SnapPerf/updates'});}catch(e){}}

function spBuildEngage(tag){
  var s=spEsc(tag);var active=spOwner||spUser;
  var anonD=active?'none':'flex';var loginD=active?'none':'inline-flex';var logoutD=active?'inline-flex':'none';
  var nameT=spOwner?('\ud83d\udc51 '+spEsc(spOwner.name)):(spUser?spEsc(spUser.name):'');
  return '<div class="sp-engage-bar-wrap"><div class="sp-engage-bar" data-tag="'+s+'">'
    +'<button class="sp-like-btn ripple-btn" aria-label="Like"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sp-like-count"></span></button>'
    +'<button class="sp-cmt-toggle ripple-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sp-comment-count">0</span></button>'
    +'<div class="sp-user-row"><span class="sp-auth-name">'+nameT+'</span><button class="sp-logout-btn ripple-btn" style="display:'+logoutD+'">Logout</button><button class="sp-login-hint ripple-btn" style="display:none"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Login</button></div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+s+'"><div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-login-row" style="display:'+loginD+';align-items:center;gap:.6rem;padding:.5rem .85rem .3rem;flex-wrap:wrap">'
    +'<span style="font-size:.76rem;color:var(--text3)">Masuk untuk komentar:</span>'
    +'<button class="sp-login-hint ripple-btn sp-login-from-cmt"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg> Login / Buat Nama</button>'
    +'<button class="sp-anon-direct ripple-btn sp-anon-quick">Lanjut Anonim</button>'
    +'</div>'
    +'<div class="sp-cmt-row"><input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off" spellcheck="false"/>'
    +'<div class="sp-anon-wrap" style="display:'+anonD+';flex-shrink:0;align-items:center"><label class="sp-anon-label"><input type="checkbox" class="sp-anon-chk"><span>Anonim</span></label></div>'
    +'<button class="sp-cmt-send ripple-btn">Kirim</button></div></div></div>';
}
window.spBuildEngage=spBuildEngage;

/* ── DOMContentLoaded ────────────────────────── */
document.addEventListener('DOMContentLoaded',function(){
  if(typeof window.supabase!=='undefined'){try{spSb=window.supabase.createClient(SP_SB_URL,SP_SB_ANON);}catch(e){}}
  spUser=spLoadUser();spInitOwner();setInterval(spTickTimes,10000);

  document.addEventListener('click',function(e){
    var lb=e.target.closest('.sp-like-btn');
    if(lb){var bar=lb.closest('.sp-engage-bar');if(bar)spToggleLike(bar.dataset.tag,bar);return;}

    var db=e.target.closest('.sp-cmt-delete,.sp-ap-del-btn');
    if(db){var id=db.dataset.id;var el=db.closest('.sp-cmt-item,.sp-ap-mitem,.sp-ap-rcmt');if(id)spDeleteComment(id,el);return;}

    var ct=e.target.closest('.sp-cmt-toggle');
    if(ct){
      var bar=ct.closest('.sp-engage-bar');if(!bar)return;
      var tag=bar.dataset.tag;var wrap=bar.closest('.sp-engage-bar-wrap');if(!wrap)return;
      var sec=wrap.querySelector('.sp-cmt-section');if(!sec)return;
      var isOpen=sec.classList.contains('sp-cmt-open');
      if(isOpen){sec.classList.remove('sp-cmt-open');sec.addEventListener('transitionend',function(){if(!sec.classList.contains('sp-cmt-open'))sec.style.display='none';},{once:true});spUnsubscribeComments(tag);}
      else{
        sec.style.display='block';requestAnimationFrame(function(){sec.classList.add('sp-cmt-open');});
        if(!sec.dataset.loaded){sec.dataset.loaded='1';spFetchComments(tag,sec);}
        spRefreshEngagement(tag,bar);spSubscribeComments(tag,sec);
        var active=spOwner||spUser;var aw=sec.querySelector('.sp-anon-wrap');if(aw)aw.style.display=active?'none':'flex';
        if(!active){spShowLoginModal(function(asAnon){var inpEl=sec.querySelector('.sp-cmt-input');var chkEl=sec.querySelector('.sp-anon-chk');var awEl=sec.querySelector('.sp-anon-wrap');if(asAnon){if(chkEl)chkEl.checked=true;if(inpEl)inpEl.placeholder='Komentar sebagai Anonim...';if(awEl)awEl.style.display='flex';}else{if(awEl)awEl.style.display='none';}if(inpEl)setTimeout(function(){inpEl.focus();},100);});}
        else{var inpEl=sec.querySelector('.sp-cmt-input');if(inpEl)setTimeout(function(){inpEl.focus();},200);}
      }
      return;
    }

    var sb=e.target.closest('.sp-cmt-send');
    if(sb){var sec=sb.closest('.sp-cmt-section');if(!sec)return;var tag=sec.dataset.tag;var inp=sec.querySelector('.sp-cmt-input');if(!inp||!inp.value.trim())return;var chk=sec.querySelector('.sp-anon-chk');var active=spOwner||spUser;var isAnon=!active||(chk?chk.checked:false);if(!active&&!isAnon){spShowLoginModal(null);return;}var wrap=sec.closest('.sp-engage-bar-wrap');var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;spSendComment(tag,inp.value,isAnon,sec,bar);return;}

    var lo=e.target.closest('.sp-logout-btn');
    if(lo){if(spOwner){spClearToken();spOwner=null;spRemoveAdminNav();}else{spClearUser();spUser=null;}spUpdateAllBars();spShowToast('Berhasil logout',true);return;}

    var lh=e.target.closest('.sp-login-hint');
    if(lh){
      // Find related comment section for context
      var relSec=lh.closest('.sp-cmt-section');
      spShowLoginModal(function(){
        spUpdateAllBars();
        // Re-show login row updated state
        if(relSec){var lr=relSec.querySelector('.sp-cmt-login-row');if(lr)lr.style.display='none';}
      });
      return;
    }
    var aq=e.target.closest('.sp-anon-quick');
    if(aq){
      // Quick anon: set anon checkbox and focus input
      var aqSec=aq.closest('.sp-cmt-section');
      if(aqSec){
        var lr2=aqSec.querySelector('.sp-cmt-login-row');if(lr2)lr2.style.display='none';
        var aw=aqSec.querySelector('.sp-anon-wrap');if(aw)aw.style.display='flex';
        var chk=aqSec.querySelector('.sp-anon-chk');if(chk)chk.checked=true;
        var inp=aqSec.querySelector('.sp-cmt-input');if(inp){inp.focus();}
      }
      return;
    }
  });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target.classList.contains('sp-cmt-input'))return;
    e.preventDefault();var sec=e.target.closest('.sp-cmt-section');if(!sec||!e.target.value.trim())return;
    var chk=sec.querySelector('.sp-anon-chk');var active=spOwner||spUser;var isAnon=!active||(chk?chk.checked:false);
    if(!active&&!isAnon){spShowLoginModal(null);return;}
    var tag=sec.dataset.tag;var wrap=sec.closest('.sp-engage-bar-wrap');var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
    spSendComment(tag,e.target.value,isAnon,sec,bar);
  });

  document.addEventListener('change',function(e){var chk=e.target.closest('.sp-anon-chk');if(!chk)return;var row=chk.closest('.sp-cmt-row');var inp=row?row.querySelector('.sp-cmt-input'):null;if(inp)inp.placeholder=chk.checked?'Komentar sebagai Anonim...':'Tulis komentar...';});
});
