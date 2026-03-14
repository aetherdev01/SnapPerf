'use strict';

var SP_GOOGLE_CLIENT_ID='537556008394-ovkhtafjkuljmoumb03frmp7vb9b3f7q.apps.googleusercontent.com';
var SP_SB_URL='https://mdielsfkmchwtdfrlidz.supabase.co';
var SP_SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWVsc2ZrbWNod3RkZnJsaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODMxNjUsImV4cCI6MjA4OTA1OTE2NX0.hjIv88F5pJMfeyM18-WdUeNYjL2mocl7KEQona9w1uY';
var SP_EJS_PK='r6IpGiVo5FCdjbdFA';
var SP_EJS_SVC='service_r5n8ytl';
var SP_EJS_TPL='template_wznau9x';
var SP_OWN_EMAIL='aldigeming41@gmail.com';

var spUser=null,spSb=null,spAnonId=null;
var SP_GSI_READY=SP_GOOGLE_CLIENT_ID.indexOf('FILL')===(-1);
var SP_SB_READY=SP_SB_URL.indexOf('FILL')===(-1)&&SP_SB_ANON.indexOf('FILL')===(-1);

function spEsc(s){return window.escHTML?window.escHTML(s):String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function spGetAnonId(){
  if(spAnonId)return spAnonId;
  var k='sp-anon-id';var id=localStorage.getItem(k);
  if(!id){id='anon_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(k,id);}
  spAnonId=id;return id;
}

function spDecodeJwt(token){
  try{var b=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(b+'='.repeat((4-b.length%4)%4)));}
  catch(e){return null;}
}

function spRelTime(ts){
  var d=new Date(ts);if(isNaN(d))return'baru saja';
  var diff=(Date.now()-d.getTime())/1000;
  if(diff<55)return'baru saja';
  if(diff<3600)return Math.floor(diff/60)+' menit lalu';
  if(diff<86400)return Math.floor(diff/3600)+' jam lalu';
  if(diff<604800)return Math.floor(diff/86400)+' hari lalu';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
}

function spFullDate(ts){
  var d=new Date(ts);if(isNaN(d))return'';
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function spInitSb(){
  if(!SP_SB_READY)return false;
  if(typeof window.supabase==='undefined')return false;
  try{spSb=window.supabase.createClient(SP_SB_URL,SP_SB_ANON);return true;}
  catch(e){return false;}
}

function spInitGsi(){
  if(!SP_GSI_READY)return;
  if(typeof google==='undefined'||!google.accounts)return;
  google.accounts.id.initialize({
    client_id:SP_GOOGLE_CLIENT_ID,
    callback:spHandleCredential,
    auto_select:true,
    cancel_on_tap_outside:false,
    use_fedcm_for_prompt:true
  });
  var saved=localStorage.getItem('sp-gsi-cred');
  if(saved){
    var p=spDecodeJwt(saved);
    if(p&&p.exp*1000>Date.now()){spSetUser(p);return;}
    localStorage.removeItem('sp-gsi-cred');
  }
  google.accounts.id.prompt(function(){});
}

function spHandleCredential(resp){
  var p=spDecodeJwt(resp.credential);if(!p)return;
  localStorage.setItem('sp-gsi-cred',resp.credential);
  spSetUser(p);
}

function spSetUser(p){
  spUser={uid:p.sub,displayName:p.name||'User',photoURL:p.picture||'',email:p.email||''};
  spUpdateAuthUI(spUser);
  document.querySelectorAll('.sp-engage-bar').forEach(function(bar){spLoadEngagement(bar.dataset.tag,bar);});
}

function spSignOut(){
  if(SP_GSI_READY&&typeof google!=='undefined'&&google.accounts)google.accounts.id.disableAutoSelect();
  localStorage.removeItem('sp-gsi-cred');
  spUser=null;
  spUpdateAuthUI(null);
}

function spUpdateAuthUI(user){
  document.querySelectorAll('.sp-user-avatar').forEach(function(el){
    if(user&&user.photoURL){el.src=user.photoURL;el.style.display='block';}
    else{el.src='';el.style.display='none';}
  });
  document.querySelectorAll('.sp-auth-name').forEach(function(el){el.textContent=user?user.displayName:'';});
  document.querySelectorAll('.sp-logout-btn').forEach(function(el){el.style.display=user?'inline-flex':'none';});
  if(SP_GSI_READY){
    document.querySelectorAll('.sp-login-hint').forEach(function(el){el.style.display=user?'none':'flex';});
  }else{
    document.querySelectorAll('.sp-login-hint').forEach(function(el){el.style.display='none';});
  }
  document.querySelectorAll('.sp-anon-wrap').forEach(function(el){el.style.display=user?'none':'flex';});
}

function spShowAuthModal(){
  if(!SP_GSI_READY)return;
  if(document.getElementById('sp-auth-modal'))return;
  var m=document.createElement('div');m.id='sp-auth-modal';m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card">'
    +'<button class="sp-auth-x" id="sp-auth-x">\u00d7</button>'
    +'<div class="sp-auth-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Login dengan Google</h3>'
    +'<p class="sp-auth-sub">Nama &amp; foto profil Google kamu akan tampil di komentar.</p>'
    +'<div id="sp-gsi-btn-wrap" style="display:flex;justify-content:center;margin:.9rem 0"></div>'
    +'<div class="sp-auth-or"><span>atau komentar tanpa login</span></div>'
    +'<p class="sp-auth-sub" style="margin-top:.55rem;margin-bottom:0;text-align:center">Centang <strong>Anonim</strong> di form untuk langsung kirim tanpa akun.</p>'
    +'</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('sp-auth-open');});
  if(typeof google!=='undefined'&&google.accounts){
    google.accounts.id.renderButton(document.getElementById('sp-gsi-btn-wrap'),{theme:'outline',size:'large',shape:'pill',text:'signin_with',width:240});
  }
  function closeModal(){m.classList.remove('sp-auth-open');m.addEventListener('transitionend',function(){m.remove();},{once:true});}
  document.getElementById('sp-auth-x').addEventListener('click',closeModal);
  m.addEventListener('click',function(e){if(e.target===m)closeModal();});
}

function spShowToast(msg,ok){
  var t=document.createElement('div');t.className='sp-toast'+(ok?' sp-toast-ok':' sp-toast-err');t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.classList.add('sp-toast-show');});
  setTimeout(function(){t.classList.remove('sp-toast-show');t.addEventListener('transitionend',function(){t.remove();},{once:true});},2600);
}

function spRenderCommentItem(d){
  var now=new Date().toISOString();
  var ts=d.created_at||now;
  var rel=spRelTime(ts);var full=spFullDate(ts);
  var isAnon=d.is_anonymous;
  var name=isAnon?'Anonim':spEsc(d.display_name||'User');
  var avatarHTML=isAnon
    ?'<div class="sp-cmt-av sp-cmt-av-fallback sp-cmt-anon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>'
    :(d.avatar_url
      ?'<img class="sp-cmt-av" src="'+spEsc(d.avatar_url)+'" loading="lazy" onerror="this.style.display=\'none\'"/>'
      :'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc((d.display_name||'?').charAt(0).toUpperCase())+'</div>');
  var item=document.createElement('div');item.className='sp-cmt-item';
  item.innerHTML=avatarHTML+'<div class="sp-cmt-body"><div class="sp-cmt-meta"><span class="sp-cmt-name'+(isAnon?' sp-cmt-anon-name':'')+'">'
    +name+'</span><span class="sp-cmt-time" title="'+full+'">'+rel+'</span></div>'
    +'<span class="sp-cmt-text">'+spEsc(d.text)+'</span></div>';
  return item;
}

async function spLoadEngagement(tag,bar){
  if(!spSb||!bar||!tag)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  try{
    var res=await spSb.from('likes').select('user_id',{count:'exact'}).eq('release_tag',tag);
    var count=res.count||0;
    var liked=res.data?res.data.some(function(r){return r.user_id===uid;}):false;
    var likeBtn=bar.querySelector('.sp-like-btn');var likeCount=bar.querySelector('.sp-like-count');
    if(likeBtn)likeBtn.classList.toggle('sp-liked',liked);
    if(likeCount)likeCount.textContent=count>0?count:'';
  }catch(e){}
  try{
    var cres=await spSb.from('comments').select('id',{count:'exact',head:true}).eq('release_tag',tag);
    var el=bar.querySelector('.sp-comment-count');
    if(el)el.textContent=cres.count||0;
  }catch(e){}
}

async function spToggleLike(tag,bar){
  if(!spSb||!tag)return;
  var uid=spUser?spUser.uid:spGetAnonId();
  try{
    var check=await spSb.from('likes').select('user_id').eq('release_tag',tag).eq('user_id',uid).maybeSingle();
    if(check.data){await spSb.from('likes').delete().eq('release_tag',tag).eq('user_id',uid);}
    else{await spSb.from('likes').insert({release_tag:tag,user_id:uid});}
    spLoadEngagement(tag,bar);
  }catch(e){}
}

async function spLoadComments(tag,section){
  if(!spSb||!section||!tag)return;
  var list=section.querySelector('.sp-cmt-list');if(!list)return;
  list.innerHTML='<div class="sp-cmt-loading"><div class="sp-spin-sm"></div></div>';
  try{
    var res=await spSb.from('comments').select('*').eq('release_tag',tag).order('created_at',{ascending:true}).limit(60);
    list.innerHTML='';
    if(!res.data||!res.data.length){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';return;}
    res.data.forEach(function(d){list.appendChild(spRenderCommentItem(d));});
  }catch(e){list.innerHTML='<p class="sp-no-cmt">Gagal memuat komentar.</p>';}
}

async function spSubmitComment(tag,text,isAnon,section,bar){
  if(!text.trim())return;
  var sendBtn=section.querySelector('.sp-cmt-send');
  var input=section.querySelector('.sp-cmt-input');
  var list=section.querySelector('.sp-cmt-list');
  var trimmed=text.trim();

  if(sendBtn){sendBtn.disabled=true;sendBtn.textContent='...';}

  var optimisticData={
    release_tag:tag,
    user_id:isAnon?spGetAnonId():(spUser?spUser.uid:spGetAnonId()),
    display_name:isAnon?'Anonim':(spUser?spUser.displayName:'Anonim'),
    avatar_url:isAnon?'':(spUser?spUser.photoURL:''),
    text:trimmed,
    is_anonymous:isAnon||!spUser,
    created_at:new Date().toISOString()
  };

  var emptyMsg=list?list.querySelector('.sp-no-cmt'):null;
  if(emptyMsg)emptyMsg.remove();

  var optimisticItem=spRenderCommentItem(optimisticData);
  optimisticItem.style.opacity='0.55';
  if(list)list.appendChild(optimisticItem);
  if(list)list.scrollTop=list.scrollHeight;

  if(input)input.value='';
  if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='Kirim';}

  if(!spSb){
    optimisticItem.style.opacity='1';
    spShowToast('\u2713 Komentar dikirim',true);
    return;
  }

  try{
    var ins=await spSb.from('comments').insert(optimisticData).select().single();
    optimisticItem.style.opacity='1';
    if(ins.data&&ins.data.created_at){
      var timEl=optimisticItem.querySelector('.sp-cmt-time');
      if(timEl){timEl.textContent=spRelTime(ins.data.created_at);timEl.title=spFullDate(ins.data.created_at);}
    }
    spShowToast('\u2713 Komentar dikirim',true);
    spLoadEngagement(tag,bar);
    if(!isAnon&&spUser)spSendOwnerEmail(tag,spUser.displayName,trimmed);
  }catch(e){
    optimisticItem.remove();
    if(list&&!list.children.length)list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';
    spShowToast('\u2717 Gagal mengirim komentar',false);
  }
}

function spSendOwnerEmail(tag,name,comment){
  if(typeof emailjs==='undefined'||!SP_EJS_PK||SP_EJS_PK.indexOf('FILL')===0)return;
  emailjs.init(SP_EJS_PK);
  emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{
    to_email:SP_OWN_EMAIL,commenter_name:name,release_tag:tag,
    comment_text:comment,site_url:'https://aetherdev01.github.io/SnapPerf/updates'
  }).catch(function(){});
}

function spBuildEngage(tag){
  var safe=spEsc(tag);
  var loginBtn=SP_GSI_READY
    ?'<button class="sp-login-hint ripple-btn">'
      +'<svg width="11" height="11" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/></svg>'
      +'Login Google</button>'
    :'';
  return '<div class="sp-engage-bar" data-tag="'+safe+'">'
    +'<button class="sp-like-btn ripple-btn" aria-label="Like">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-like-count"></span></button>'
    +'<button class="sp-cmt-toggle ripple-btn">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-comment-count">0</span></button>'
    +'<div class="sp-user-row">'
    +'<img class="sp-user-avatar" style="display:none" alt=""/>'
    +'<span class="sp-auth-name"></span>'
    +'<button class="sp-logout-btn ripple-btn" style="display:none">Logout</button>'
    +loginBtn
    +'</div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+safe+'">'
    +'<div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-row">'
    +'<input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off"/>'
    +'<div class="sp-anon-wrap">'
    +'<label class="sp-anon-label"><input type="checkbox" class="sp-anon-chk"/><span>Anonim</span></label>'
    +'</div>'
    +'<button class="sp-cmt-send ripple-btn">Kirim</button>'
    +'</div>'
    +'</div>';
}
window.spBuildEngage=spBuildEngage;
window.spLoadEngagement=spLoadEngagement;

document.addEventListener('DOMContentLoaded',function(){
  spInitSb();

  if(SP_GSI_READY){
    var gsiScript=document.createElement('script');
    gsiScript.src='https://accounts.google.com/gsi/client';
    gsiScript.async=true;gsiScript.defer=true;
    gsiScript.onload=spInitGsi;
    document.head.appendChild(gsiScript);
  }

  spUpdateAuthUI(null);

  document.addEventListener('click',function(e){
    var lb=e.target.closest('.sp-like-btn');
    if(lb){var bar=lb.closest('.sp-engage-bar');if(bar)spToggleLike(bar.dataset.tag,bar);return;}

    var ct=e.target.closest('.sp-cmt-toggle');
    if(ct){
      var bar=ct.closest('.sp-engage-bar');if(!bar)return;
      var tag=bar.dataset.tag;
      var sec=bar.nextElementSibling;
      if(!sec||!sec.classList.contains('sp-cmt-section'))return;
      var open=sec.classList.contains('sp-cmt-open');
      if(open){
        sec.classList.remove('sp-cmt-open');
        sec.addEventListener('transitionend',function(){if(!sec.classList.contains('sp-cmt-open'))sec.style.display='none';},{once:true});
      }else{
        sec.style.display='block';
        requestAnimationFrame(function(){sec.classList.add('sp-cmt-open');});
        if(!sec.dataset.loaded){sec.dataset.loaded='1';spLoadComments(tag,sec);}
        spLoadEngagement(tag,bar);
        var aw=sec.querySelector('.sp-anon-wrap');
        if(aw)aw.style.display=spUser?'none':'flex';
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
      var bar=document.querySelector('.sp-engage-bar[data-tag="'+CSS.escape(tag)+'"]')||sec.previousElementSibling;
      spSubmitComment(tag,inp.value,isAnon,sec,bar);
      return;
    }

    var lo=e.target.closest('.sp-logout-btn');if(lo){spSignOut();return;}
    var lh=e.target.closest('.sp-login-hint');if(lh){spShowAuthModal();return;}
  });

  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||!e.target.classList.contains('sp-cmt-input'))return;
    e.preventDefault();
    var sec=e.target.closest('.sp-cmt-section');if(!sec)return;
    if(!e.target.value.trim())return;
    var tag=sec.dataset.tag;
    var anonChk=sec.querySelector('.sp-anon-chk');
    var isAnon=!spUser||(anonChk?anonChk.checked:true);
    var bar=sec.previousElementSibling;
    spSubmitComment(tag,e.target.value,isAnon,sec,bar);
  });

  document.addEventListener('change',function(e){
    var chk=e.target.closest('.sp-anon-chk');if(!chk)return;
    var sec=chk.closest('.sp-cmt-section');if(!sec)return;
    var inp=sec.querySelector('.sp-cmt-input');
    if(inp)inp.placeholder=chk.checked?'Komentar sebagai Anonim...':'Tulis komentar...';
  });
});
