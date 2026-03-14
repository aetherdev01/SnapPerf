'use strict';

var SP_SB_URL='https://mdielsfkmchwtdfrlidz.supabase.co';
var SP_SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWVsc2ZrbWNod3RkZnJsaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODMxNjUsImV4cCI6MjA4OTA1OTE2NX0.hjIv88F5pJMfeyM18-WdUeNYjL2mocl7KEQona9w1uY';
var SP_EJS_PK='r6IpGiVo5FCdjbdFA';
var SP_EJS_SVC='service_r5n8ytl';
var SP_EJS_TPL='template_wznau9x';
var SP_OWN_EMAIL='aldigeming41@gmail.com';
var SP_OWN_GH_USER='aetherdev01';

var spSb=null;
var spUser=null;
var spOwner=null;
var spAnonId=null;
var spChannels={};

function spEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function spGetAnonId(){
  if(spAnonId)return spAnonId;
  var id=localStorage.getItem('sp-anon-id');
  if(!id){id='a'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('sp-anon-id',id);}
  spAnonId=id;return id;
}

function spLoadUser(){try{var u=localStorage.getItem('sp-user');return u?JSON.parse(u):null;}catch(e){return null;}}
function spSaveUser(u){try{localStorage.setItem('sp-user',JSON.stringify(u));}catch(e){}}
function spClearUser(){localStorage.removeItem('sp-user');}

function spLoadOwner(){try{var o=localStorage.getItem('sp-owner');return o?JSON.parse(o):null;}catch(e){return null;}}
function spSaveOwner(o){try{localStorage.setItem('sp-owner',JSON.stringify(o));}catch(e){}}
function spClearOwner(){localStorage.removeItem('sp-owner');localStorage.removeItem('sp-owner-token');}
function spSaveOwnerToken(t){try{localStorage.setItem('sp-owner-token',t);}catch(e){}}
function spLoadOwnerToken(){return localStorage.getItem('sp-owner-token')||'';}

function spIsOwner(){return!!spOwner;}

function spRelTime(ts){
  if(!ts)return'baru saja';
  var d=new Date(ts);if(isNaN(d.getTime()))return'baru saja';
  var s=(Date.now()-d.getTime())/1000;
  if(s<2)return'baru saja';
  if(s<60)return Math.floor(s)+' detik lalu';
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

function spTickTimes(){
  document.querySelectorAll('.sp-cmt-time[data-ts]').forEach(function(el){
    el.textContent=spRelTime(el.dataset.ts);
  });
}

function spShowToast(msg,ok){
  document.querySelectorAll('.sp-toast').forEach(function(t){t.remove();});
  var t=document.createElement('div');
  t.className='sp-toast '+(ok?'sp-toast-ok':'sp-toast-err');
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.classList.add('sp-toast-show');});
  setTimeout(function(){t.classList.remove('sp-toast-show');t.addEventListener('transitionend',function(){if(t.parentNode)t.remove();},{once:true});},2800);
}

function spCloseModal(id){
  var m=document.getElementById(id);if(!m)return;
  m.classList.remove('sp-auth-open');
  setTimeout(function(){if(m.parentNode)m.remove();},280);
}

function spApplyUserToBar(bar){
  var u=spUser;
  var nm=bar.querySelector('.sp-auth-name');
  var lo=bar.querySelector('.sp-logout-btn');
  var li=bar.querySelector('.sp-login-hint');
  if(nm)nm.textContent=u?u.name:(spOwner?'👑 '+spOwner.name:'');
  if(lo)lo.style.display=(u||spOwner)?'inline-flex':'none';
  if(li)li.style.display=(u||spOwner)?'none':'inline-flex';
  var wrap=bar.closest('.sp-engage-bar-wrap');
  var sec=wrap?wrap.querySelector('.sp-cmt-section'):null;
  var aw=sec?sec.querySelector('.sp-anon-wrap'):null;
  if(aw)aw.style.display=(u||spOwner)?'none':'flex';
}

function spUpdateAllBars(){
  document.querySelectorAll('.sp-engage-bar').forEach(function(bar){
    spApplyUserToBar(bar);
    var tag=bar.dataset.tag;
    if(tag)spRefreshEngagement(tag,bar);
  });
  document.querySelectorAll('.sp-cmt-delete').forEach(function(btn){
    btn.style.display=spIsOwner()?'inline-flex':'none';
  });
}
window.spUpdateAllBars=spUpdateAllBars;

async function spVerifyOwnerToken(token){
  try{
    var r=await fetch('https://api.github.com/user',{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github.v3+json'}});
    if(!r.ok)return null;
    var d=await r.json();
    if(d.login&&d.login.toLowerCase()===SP_OWN_GH_USER.toLowerCase()){
      return{name:d.name||d.login,login:d.login,avatar:d.avatar_url||''};
    }
    return null;
  }catch(e){return null;}
}

function spShowOwnerPanel(){
  if(document.getElementById('sp-owner-panel'))return;
  var isLogged=spIsOwner();
  var token=spLoadOwnerToken();
  var m=document.createElement('div');m.id='sp-owner-panel';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card sp-owner-card">'
    +'<button class="sp-auth-x" id="sp-own-x">\u00d7</button>'
    +'<div class="sp-auth-ico sp-owner-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Panel Owner</h3>'
    +(isLogged
      ?'<div class="sp-owner-logged"><div class="sp-owner-info">'
        +(spOwner.avatar?'<img class="sp-owner-av" src="'+spEsc(spOwner.avatar)+'" alt=""/>':'')
        +'<div><div class="sp-owner-name">'+spEsc(spOwner.name)+'</div>'
        +'<div class="sp-owner-role">@'+spEsc(spOwner.login||SP_OWN_GH_USER)+' · Owner</div></div>'
        +'</div>'
        +'<p class="sp-auth-sub" style="margin:.6rem 0 .9rem">Mode moderasi aktif. Tombol hapus tersedia di semua komentar.</p>'
        +'<button class="sp-anon-direct ripple-btn" id="sp-own-logout">Logout Owner</button>'
        +'</div>'
      :'<p class="sp-auth-sub">Masukkan GitHub token untuk akses moderasi komentar.</p>'
        +'<div class="sp-name-form sp-token-form">'
        +'<div class="sp-token-wrap">'
        +'<input class="sp-name-input" id="sp-own-inp" type="password" placeholder="ghp_xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"/>'
        +'<button class="sp-eye-btn" id="sp-own-eye" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg></button>'
        +'</div>'
        +'<button class="sp-name-submit ripple-btn" id="sp-own-ok">Verifikasi</button>'
        +'</div>'
        +'<div class="sp-owner-status" id="sp-own-status"></div>'
    )
    +'</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('sp-auth-open');});

  document.getElementById('sp-own-x').addEventListener('click',function(){spCloseModal('sp-owner-panel');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-owner-panel');});

  if(isLogged){
    document.getElementById('sp-own-logout').addEventListener('click',function(){
      spClearOwner();spOwner=null;spUpdateAllBars();spCloseModal('sp-owner-panel');
      spShowToast('Logout owner berhasil',true);
    });
    return;
  }

  var inp=document.getElementById('sp-own-inp');
  var eye=document.getElementById('sp-own-eye');
  var ok=document.getElementById('sp-own-ok');
  var status=document.getElementById('sp-own-status');
  if(token&&inp)inp.value=token;
  setTimeout(function(){if(inp)inp.focus();},200);

  if(eye){eye.addEventListener('click',function(){
    if(!inp)return;
    var show=inp.type==='password';inp.type=show?'text':'password';
    eye.innerHTML=show
      ?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      :'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';
  });}

  async function doVerify(){
    var t=inp?inp.value.trim():'';
    if(!t){if(inp){inp.classList.add('sp-shake');setTimeout(function(){inp.classList.remove('sp-shake');},400);}return;}
    if(ok){ok.disabled=true;ok.textContent='Memverifikasi...';}
    if(status){status.className='sp-owner-status sp-own-checking';status.textContent='Menghubungi GitHub...';}
    var data=await spVerifyOwnerToken(t);
    if(ok){ok.disabled=false;ok.textContent='Verifikasi';}
    if(data){
      spSaveOwnerToken(t);
      spOwner=data;spSaveOwner(data);
      spCloseModal('sp-owner-panel');
      spUpdateAllBars();
      spShowToast('\u2713 Selamat datang, '+data.name+'! Mode owner aktif.',true);
      document.querySelectorAll('.sp-cmt-delete').forEach(function(btn){btn.style.display='inline-flex';});
    }else{
      if(status){status.className='sp-owner-status sp-own-err';status.textContent='\u2717 Token tidak valid atau bukan akun owner.';}
    }
  }

  if(ok)ok.addEventListener('click',doVerify);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doVerify();}});
}

function spShowLoginModal(onDone){
  if(document.getElementById('sp-login-modal'))return;
  var m=document.createElement('div');m.id='sp-login-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card">'
    +'<button class="sp-auth-x" id="sp-modal-x">\u00d7</button>'
    +'<div class="sp-auth-ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Masuk untuk Komentar</h3>'
    +'<p class="sp-auth-sub">Nama kamu akan tersimpan dan tidak perlu diisi ulang.</p>'
    +'<div class="sp-name-form">'
    +'<input class="sp-name-input" id="sp-name-inp" type="text" placeholder="Nama kamu..." maxlength="32" autocomplete="nickname" spellcheck="false"/>'
    +'<button class="sp-name-submit ripple-btn" id="sp-name-ok">Simpan</button>'
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
    if(!nm){if(inp){inp.classList.add('sp-shake');setTimeout(function(){inp.classList.remove('sp-shake');},400);}return;}
    spUser={uid:'u_'+nm.toLowerCase().replace(/\W/g,'').slice(0,12)+'_'+spGetAnonId().slice(-6),name:nm,via:'name'};
    spSaveUser(spUser);spCloseModal('sp-login-modal');
    spShowToast('\u2713 Hai, '+spUser.name+'! Login tersimpan.',true);
    spUpdateAllBars();if(onDone)onDone(false);
  }
  function doAnon(){spCloseModal('sp-login-modal');if(onDone)onDone(true);}
  document.getElementById('sp-name-ok').addEventListener('click',doName);
  document.getElementById('sp-anon-ok').addEventListener('click',doAnon);
  if(inp)inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doName();}});
  document.getElementById('sp-modal-x').addEventListener('click',function(){spCloseModal('sp-login-modal');});
  m.addEventListener('click',function(e){if(e.target===m)spCloseModal('sp-login-modal');});
}

async function spDeleteComment(id,el){
  if(!spSb||!id)return;
  if(!confirm('Hapus komentar ini?'))return;
  try{
    var r=await spSb.from('sp_comments').delete().eq('id',id);
    if(r.error)throw r.error;
    el.style.transition='opacity .25s,transform .25s';
    el.style.opacity='0';el.style.transform='translateX(12px)';
    setTimeout(function(){
      var list=el.parentNode;
      el.remove();
      if(list&&!list.querySelector('.sp-cmt-item'))list.innerHTML='<p class="sp-no-cmt">Belum ada komentar.</p>';
    },260);
    var bar=el.closest('.sp-engage-bar-wrap')&&el.closest('.sp-engage-bar-wrap').querySelector('.sp-engage-bar');
    var tag=bar?bar.dataset.tag:'';
    if(bar&&tag)spRefreshEngagement(tag,bar);
    spShowToast('\u2713 Komentar dihapus',true);
  }catch(e){spShowToast('\u2717 Gagal hapus: '+(e.message||''),false);}
}

function spMakeCmtEl(d,isOptimistic){
  var ts=d.created_at||new Date().toISOString();
  var rel=spRelTime(ts);var full=spFullDate(ts);
  var isAnon=!!d.is_anonymous;
  var name=isAnon?'Anonim':spEsc(d.display_name||'User');
  var ini=(isAnon?'?':(d.display_name||'?')).charAt(0).toUpperCase();
  var av=isAnon
    ?'<div class="sp-cmt-av sp-cmt-av-fallback sp-cmt-anon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>'
    :'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc(ini)+'</div>';
  var delBtn='<button class="sp-cmt-delete ripple-btn" data-id="'+spEsc(d.id||'')+'" style="display:'+(spIsOwner()?'inline-flex':'none')+'" title="Hapus komentar">'
    +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'</button>';
  var el=document.createElement('div');
  el.className='sp-cmt-item'+(isOptimistic?' sp-cmt-optimistic':'');
  if(d.id)el.dataset.cmtId=d.id;
  el.innerHTML=av+'<div class="sp-cmt-body"><div class="sp-cmt-meta">'
    +'<span class="sp-cmt-name'+(isAnon?' sp-cmt-anon-name':'')+'">'+name+'</span>'
    +'<span class="sp-cmt-time" data-ts="'+spEsc(ts)+'" title="'+full+'">'+rel+'</span>'
    +delBtn
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
    var lb=bar.querySelector('.sp-like-btn');var lc=bar.querySelector('.sp-like-count');
    if(lb)lb.classList.toggle('sp-liked',liked);
    if(lc)lc.textContent=rows.length>0?rows.length:'';
  }catch(e){}
  try{
    var cr=await spSb.from('sp_comments').select('id',{count:'exact',head:true}).eq('release_tag',tag);
    if(!cr.error){var cc=bar.querySelector('.sp-comment-count');if(cc)cc.textContent=cr.count||0;}
  }catch(e){}
}
window.spLoadEngagement=spRefreshEngagement;

function spSubscribeComments(tag,section){
  if(!spSb||!tag||spChannels[tag])return;
  var list=section.querySelector('.sp-cmt-list');
  try{
    var ch=spSb.channel('cmt_'+tag)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'sp_comments',filter:'release_tag=eq.'+tag},function(payload){
        var d=payload.new;if(!d||!d.text)return;
        var uid=spUser?spUser.uid:spGetAnonId();
        var optEls=list?list.querySelectorAll('.sp-cmt-optimistic'):[];
        for(var i=0;i<optEls.length;i++){
          var o=optEls[i];
          if(d.user_id===uid&&o.querySelector('.sp-cmt-text')&&o.querySelector('.sp-cmt-text').textContent===d.text){
            o.classList.remove('sp-cmt-optimistic');o.style.opacity='1';
            if(d.id)o.dataset.cmtId=d.id;
            var db=o.querySelector('.sp-cmt-delete');if(db)db.dataset.id=d.id;
            var te=o.querySelector('.sp-cmt-time');
            if(te){te.textContent=spRelTime(d.created_at);te.dataset.ts=d.created_at;te.title=spFullDate(d.created_at);}
            return;
          }
        }
        if(list){var el=spMakeCmtEl(d);el.classList.add('sp-cmt-realtime');list.appendChild(el);list.scrollTop=list.scrollHeight;}
        var wrap=section.closest('.sp-engage-bar-wrap');
        var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
        if(bar)spRefreshEngagement(tag,bar);
      })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'sp_comments',filter:'release_tag=eq.'+tag},function(payload){
        var old=payload.old;if(!old||!old.id)return;
        var el=list?list.querySelector('[data-cmt-id="'+old.id+'"]'):null;
        if(el){el.style.transition='opacity .2s';el.style.opacity='0';setTimeout(function(){el.remove();},220);}
        var wrap=section.closest('.sp-engage-bar-wrap');
        var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
        if(bar)spRefreshEngagement(tag,bar);
      })
      .subscribe();
    spChannels[tag]=ch;
  }catch(e){}
}

function spUnsubscribeComments(tag){
  if(!spSb||!spChannels[tag])return;
  try{spSb.removeChannel(spChannels[tag]);}catch(e){}
  delete spChannels[tag];
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
  var uid=isAnon?spGetAnonId():(spOwner?'owner_'+spGetAnonId().slice(-8):(spUser?spUser.uid:spGetAnonId()));
  var dname=isAnon?'Anonim':(spOwner?spOwner.name:(spUser?spUser.name:'Anonim'));
  var optData={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||(!spUser&&!spOwner),created_at:new Date().toISOString()};
  var emptyEl=list?list.querySelector('.sp-no-cmt'):null;if(emptyEl)emptyEl.remove();
  var optEl=spMakeCmtEl(optData,true);optEl.style.opacity='0.5';
  if(list){list.appendChild(optEl);list.scrollTop=list.scrollHeight;}
  if(inp)inp.value='';
  if(btn){btn.disabled=false;btn.textContent='Kirim';}
  if(!spSb){optEl.style.opacity='1';optEl.classList.remove('sp-cmt-optimistic');spShowToast('\u2713 Komentar terkirim',true);return;}
  try{
    var payload={release_tag:tag,user_id:uid,display_name:dname,avatar_url:'',text:trimmed,is_anonymous:isAnon||(!spUser&&!spOwner)};
    var ins=await spSb.from('sp_comments').insert(payload).select();
    if(ins.error)throw ins.error;
    var saved=ins.data&&ins.data[0];
    if(saved){
      if(saved.id){optEl.dataset.cmtId=saved.id;var db=optEl.querySelector('.sp-cmt-delete');if(db)db.dataset.id=saved.id;}
      if(saved.created_at){var te=optEl.querySelector('.sp-cmt-time');if(te){te.textContent=spRelTime(saved.created_at);te.dataset.ts=saved.created_at;te.title=spFullDate(saved.created_at);}}
    }
    optEl.style.opacity='1';optEl.classList.remove('sp-cmt-optimistic');
    spShowToast('\u2713 Komentar terkirim!',true);
    await spRefreshEngagement(tag,bar);
    if(!isAnon&&spUser)spSendEmail(tag,spUser.name,trimmed);
  }catch(e){
    optEl.remove();
    var errMsg=e&&e.message?e.message:'';
    if(errMsg.indexOf('relation')!==-1||errMsg.indexOf('does not exist')!==-1)spShowToast('\u2717 Tabel belum dibuat. Jalankan SUPABASE_SETUP.sql',false);
    else if(errMsg.indexOf('policy')!==-1||errMsg.indexOf('violates')!==-1)spShowToast('\u2717 RLS policy error. Cek Supabase.',false);
    else spShowToast('\u2717 Gagal kirim: '+(errMsg.slice(0,60)||'error'),false);
    if(list&&!list.querySelector('.sp-cmt-item'))list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';
  }
}

async function spToggleLike(tag,bar){
  if(!tag||!bar)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  var lb=bar.querySelector('.sp-like-btn');var lc=bar.querySelector('.sp-like-count');
  var wasLiked=lb&&lb.classList.contains('sp-liked');
  var cur=parseInt((lc?lc.textContent:'')||'0',10)||0;
  if(lb)lb.classList.toggle('sp-liked',!wasLiked);
  if(lc)lc.textContent=wasLiked?Math.max(0,cur-1)||'':cur+1;
  if(!spSb)return;
  try{
    var ex=await spSb.from('sp_likes').select('user_id').eq('release_tag',tag).eq('user_id',uid);
    if(ex.error)throw ex.error;
    if(ex.data&&ex.data.length>0){var d=await spSb.from('sp_likes').delete().eq('release_tag',tag).eq('user_id',uid);if(d.error)throw d.error;}
    else{var i=await spSb.from('sp_likes').insert({release_tag:tag,user_id:uid});if(i.error)throw i.error;}
    await spRefreshEngagement(tag,bar);
  }catch(e){if(lb)lb.classList.toggle('sp-liked',wasLiked);if(lc)lc.textContent=cur||'';}
}

function spSendEmail(tag,name,text){
  if(typeof emailjs==='undefined')return;
  try{emailjs.init(SP_EJS_PK);emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{to_email:SP_OWN_EMAIL,commenter_name:name,release_tag:tag,comment_text:text,site_url:'https://aetherdev01.github.io/SnapPerf/updates'});}catch(e){}
}

function spBuildEngage(tag){
  var s=spEsc(tag);
  var u=spUser||spOwner;
  var anonDisplay=u?'none':'flex';
  var loginDisplay=u?'none':'inline-flex';
  var logoutDisplay=u?'inline-flex':'none';
  var nameText=spOwner?'👑 '+spEsc(spOwner.name):(spUser?spEsc(spUser.name):'');
  return '<div class="sp-engage-bar-wrap">'
    +'<div class="sp-engage-bar" data-tag="'+s+'">'
    +'<button class="sp-like-btn ripple-btn" aria-label="Like">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-like-count"></span></button>'
    +'<button class="sp-cmt-toggle ripple-btn">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-comment-count">0</span></button>'
    +'<div class="sp-user-row">'
    +'<span class="sp-auth-name">'+nameText+'</span>'
    +'<button class="sp-logout-btn ripple-btn" style="display:'+logoutDisplay+'">Logout</button>'
    +'<button class="sp-login-hint ripple-btn" style="display:'+loginDisplay+'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Login</button>'
    +'</div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+s+'">'
    +'<div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-row">'
    +'<input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off" spellcheck="false"/>'
    +'<div class="sp-anon-wrap" style="display:'+anonDisplay+';flex-shrink:0;align-items:center">'
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
  spOwner=spLoadOwner();

  setInterval(spTickTimes,10000);

  var ownerTriggerSeq='';
  document.addEventListener('keydown',function(e){
    if(e.target.closest('input,textarea'))return;
    ownerTriggerSeq+=(e.key||'').toLowerCase();
    if(ownerTriggerSeq.length>10)ownerTriggerSeq=ownerTriggerSeq.slice(-10);
    if(ownerTriggerSeq.endsWith('owner'))spShowOwnerPanel();
  });

  var ownerFab=document.createElement('button');
  ownerFab.id='sp-owner-fab';ownerFab.className='sp-owner-fab ripple-btn';ownerFab.title='Panel Owner';
  ownerFab.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  ownerFab.addEventListener('click',spShowOwnerPanel);
  document.body.appendChild(ownerFab);

  document.addEventListener('click',function(e){

    var lb=e.target.closest('.sp-like-btn');
    if(lb){var bar=lb.closest('.sp-engage-bar');if(bar)spToggleLike(bar.dataset.tag,bar);return;}

    var db=e.target.closest('.sp-cmt-delete');
    if(db){
      var cmtEl=db.closest('.sp-cmt-item');
      var id=db.dataset.id||'';
      if(cmtEl&&id)spDeleteComment(id,cmtEl);
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
        sec.addEventListener('transitionend',function(){if(!sec.classList.contains('sp-cmt-open'))sec.style.display='none';},{once:true});
        spUnsubscribeComments(tag);
      }else{
        sec.style.display='block';
        requestAnimationFrame(function(){sec.classList.add('sp-cmt-open');});
        if(!sec.dataset.loaded){sec.dataset.loaded='1';spFetchComments(tag,sec);}
        spRefreshEngagement(tag,bar);
        spSubscribeComments(tag,sec);
        var aw=sec.querySelector('.sp-anon-wrap');
        if(aw)aw.style.display=(spUser||spOwner)?'none':'flex';
        if(!spUser&&!spOwner){
          spShowLoginModal(function(asAnon){
            var inpEl=sec.querySelector('.sp-cmt-input');
            var chkEl=sec.querySelector('.sp-anon-chk');
            var awEl=sec.querySelector('.sp-anon-wrap');
            if(asAnon){if(chkEl)chkEl.checked=true;if(inpEl)inpEl.placeholder='Komentar sebagai Anonim...';if(awEl)awEl.style.display='flex';}
            else{if(awEl)awEl.style.display='none';}
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
      var isAnon=!spUser&&!spOwner||(chk?chk.checked:false);
      if(!spUser&&!spOwner&&!isAnon){spShowLoginModal(null);return;}
      var wrap=sec.closest('.sp-engage-bar-wrap');
      var bar=wrap?wrap.querySelector('.sp-engage-bar'):null;
      spSendComment(tag,inp.value,isAnon,sec,bar);
      return;
    }

    var lo=e.target.closest('.sp-logout-btn');
    if(lo){
      if(spOwner){spClearOwner();spOwner=null;}
      else{spClearUser();spUser=null;}
      spUpdateAllBars();spShowToast('Berhasil logout',true);return;
    }

    var lh=e.target.closest('.sp-login-hint');
    if(lh){spShowLoginModal(function(){spUpdateAllBars();});return;}
  });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target.classList.contains('sp-cmt-input'))return;
    e.preventDefault();
    var sec=e.target.closest('.sp-cmt-section');if(!sec)return;
    if(!e.target.value.trim())return;
    var chk=sec.querySelector('.sp-anon-chk');
    var isAnon=!spUser&&!spOwner||(chk?chk.checked:false);
    if(!spUser&&!spOwner&&!isAnon){spShowLoginModal(null);return;}
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
