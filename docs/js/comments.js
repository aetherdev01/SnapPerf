'use strict';

var SP_FB_CFG={
  apiKey:'FILL_FIREBASE_API_KEY',
  authDomain:'FILL_PROJECT_ID.firebaseapp.com',
  projectId:'FILL_PROJECT_ID',
  storageBucket:'FILL_PROJECT_ID.appspot.com',
  messagingSenderId:'FILL_SENDER_ID',
  appId:'FILL_APP_ID'
};
var SP_EJS_PK='FILL_EMAILJS_PUBLIC_KEY';
var SP_EJS_SVC='FILL_EMAILJS_SERVICE_ID';
var SP_EJS_TPL='FILL_EMAILJS_TEMPLATE_ID';
var SP_OWN_EMAIL='FILL_OWNER_GMAIL';

var spAuth=null,spDb=null,spUser=null,spFbReady=false;

function spEsc(s){return window.escHTML?window.escHTML(s):String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function spInitFb(){
  if(typeof firebase==='undefined')return false;
  try{
    if(!firebase.apps.length)firebase.initializeApp(SP_FB_CFG);
    spAuth=firebase.auth();
    spDb=firebase.firestore();
    spFbReady=true;
    return true;
  }catch(e){return false;}
}

function spSignIn(){
  if(!spAuth)return;
  var p=new firebase.auth.GoogleAuthProvider();
  p.setCustomParameters({prompt:'select_account'});
  spAuth.signInWithPopup(p).catch(function(){});
}

function spSignOut(){
  if(!spAuth)return;
  spAuth.signOut();
}

function spUpdateAuthUI(user){
  document.querySelectorAll('.sp-user-avatar').forEach(function(el){
    el.src=user?(user.photoURL||''):'';
    el.style.display=user?'block':'none';
  });
  document.querySelectorAll('.sp-auth-name').forEach(function(el){
    el.textContent=user?user.displayName:'';
  });
  document.querySelectorAll('.sp-logout-btn').forEach(function(el){
    el.style.display=user?'inline-flex':'none';
  });
  document.querySelectorAll('.sp-login-hint').forEach(function(el){
    el.style.display=user?'none':'flex';
  });
  if(user){
    document.querySelectorAll('.sp-engage-bar').forEach(function(bar){
      spLoadEngagement(bar.dataset.tag,bar);
    });
  }
}

function spShowAuthModal(){
  if(document.getElementById('sp-auth-modal'))return;
  var m=document.createElement('div');
  m.id='sp-auth-modal';
  m.className='sp-auth-overlay';
  m.innerHTML='<div class="sp-auth-card"><button class="sp-auth-x" id="sp-auth-x">\u00d7</button>'
    +'<div class="sp-auth-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--accent)" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg></div>'
    +'<h3 class="sp-auth-title">Login untuk Lanjut</h3>'
    +'<p class="sp-auth-sub">Masuk dengan akun Google untuk memberi komentar atau like pada rilis.</p>'
    +'<button class="sp-google-btn ripple-btn" id="sp-google-btn">'
    +'<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/></svg>'
    +'Lanjutkan dengan Google</button></div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('sp-auth-open');});
  function closeModal(){
    m.classList.remove('sp-auth-open');
    m.addEventListener('transitionend',function(){m.remove();},{once:true});
  }
  document.getElementById('sp-auth-x').addEventListener('click',closeModal);
  m.addEventListener('click',function(e){if(e.target===m)closeModal();});
  document.getElementById('sp-google-btn').addEventListener('click',function(){spSignIn();closeModal();});
}

function spLoadEngagement(tag,bar){
  if(!spDb||!bar||!tag)return;
  spDb.collection('releases').doc(tag).get().then(function(doc){
    var data=doc.exists?doc.data():{likes:0,likedBy:[]};
    var likedBy=data.likedBy||[];
    var liked=spUser&&likedBy.indexOf(spUser.uid)!==-1;
    var likeBtn=bar.querySelector('.sp-like-btn');
    var likeCount=bar.querySelector('.sp-like-count');
    if(likeBtn)likeBtn.classList.toggle('sp-liked',liked);
    if(likeCount)likeCount.textContent=likedBy.length>0?likedBy.length:'';
  }).catch(function(){});
  spDb.collection('releases').doc(tag).collection('comments').get().then(function(snap){
    var el=bar.querySelector('.sp-comment-count');
    if(el)el.textContent=snap.size||0;
  }).catch(function(){});
}

function spToggleLike(tag,bar){
  if(!spUser){spShowAuthModal();return;}
  if(!spDb||!tag)return;
  var ref=spDb.collection('releases').doc(tag);
  ref.get().then(function(doc){
    var data=doc.exists?doc.data():{likes:0,likedBy:[]};
    var likedBy=(data.likedBy||[]).slice();
    var idx=likedBy.indexOf(spUser.uid);
    if(idx===-1)likedBy.push(spUser.uid);
    else likedBy.splice(idx,1);
    return ref.set({likes:likedBy.length,likedBy:likedBy},{merge:true});
  }).then(function(){
    spLoadEngagement(tag,bar);
  }).catch(function(){});
}

function spLoadComments(tag,section){
  if(!spDb||!section||!tag)return;
  var list=section.querySelector('.sp-cmt-list');
  if(!list)return;
  list.innerHTML='<div class="sp-cmt-loading"><div class="sp-spin-sm"></div></div>';
  spDb.collection('releases').doc(tag).collection('comments')
    .orderBy('timestamp','asc').limit(30).get().then(function(snap){
      if(snap.empty){list.innerHTML='<p class="sp-no-cmt">Belum ada komentar. Jadilah yang pertama!</p>';return;}
      list.innerHTML='';
      snap.forEach(function(doc){
        var d=doc.data();
        var item=document.createElement('div');
        item.className='sp-cmt-item';
        var avatarHTML=d.photoURL?'<img class="sp-cmt-av" src="'+spEsc(d.photoURL)+'" loading="lazy" onerror="this.style.display=\'none\'"/>':'<div class="sp-cmt-av sp-cmt-av-fallback">'+spEsc((d.displayName||'?').charAt(0).toUpperCase())+'</div>';
        item.innerHTML=avatarHTML+'<div class="sp-cmt-body"><span class="sp-cmt-name">'+spEsc(d.displayName||'User')+'</span><span class="sp-cmt-text">'+spEsc(d.text)+'</span></div>';
        list.appendChild(item);
      });
    }).catch(function(){
      list.innerHTML='<p class="sp-no-cmt">Gagal memuat komentar.</p>';
    });
}

function spSubmitComment(tag,text,section,bar){
  if(!spUser||!spDb||!text.trim())return;
  var ref=spDb.collection('releases').doc(tag).collection('comments').doc();
  var sendBtn=section.querySelector('.sp-cmt-send');
  var input=section.querySelector('.sp-cmt-input');
  if(sendBtn){sendBtn.disabled=true;sendBtn.textContent='...';}
  ref.set({
    userId:spUser.uid,
    displayName:spUser.displayName||'User',
    photoURL:spUser.photoURL||'',
    text:text.trim(),
    timestamp:firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    if(input)input.value='';
    if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='Kirim';}
    spLoadComments(tag,section);
    spLoadEngagement(tag,bar);
    spSendOwnerEmail(tag,spUser.displayName||'User',text.trim());
  }).catch(function(){
    if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='Kirim';}
  });
}

function spSendOwnerEmail(tag,name,comment){
  if(typeof emailjs==='undefined'||!SP_EJS_PK||SP_EJS_PK.indexOf('FILL')===0)return;
  emailjs.init(SP_EJS_PK);
  emailjs.send(SP_EJS_SVC,SP_EJS_TPL,{
    to_email:SP_OWN_EMAIL,
    commenter_name:name,
    release_tag:tag,
    comment_text:comment,
    site_url:'https://aetherdev01.github.io/SnapPerf/updates'
  }).catch(function(){});
}

function spBuildEngage(tag){
  var safe=spEsc(tag);
  return '<div class="sp-engage-bar" data-tag="'+safe+'">'
    +'<button class="sp-like-btn ripple-btn" aria-label="Like">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-like-count"></span></button>'
    +'<button class="sp-cmt-toggle ripple-btn" aria-label="Komentar">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'<span class="sp-comment-count">0</span></button>'
    +'<div class="sp-user-row">'
    +'<img class="sp-user-avatar" style="display:none" alt="avatar"/>'
    +'<span class="sp-auth-name"></span>'
    +'<button class="sp-logout-btn ripple-btn" style="display:none">Logout</button>'
    +'<button class="sp-login-hint ripple-btn">'
    +'<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    +'Login</button>'
    +'</div>'
    +'</div>'
    +'<div class="sp-cmt-section" data-tag="'+safe+'">'
    +'<div class="sp-cmt-list"></div>'
    +'<div class="sp-cmt-row">'
    +'<input class="sp-cmt-input" type="text" placeholder="Tulis komentar..." maxlength="280" autocomplete="off"/>'
    +'<button class="sp-cmt-send ripple-btn">Kirim</button>'
    +'</div>'
    +'</div>';
}
window.spBuildEngage=spBuildEngage;

document.addEventListener('DOMContentLoaded',function(){
  if(!spInitFb())return;

  spAuth.onAuthStateChanged(function(user){
    spUser=user;
    spUpdateAuthUI(user);
  });

  document.addEventListener('click',function(e){
    var lb=e.target.closest('.sp-like-btn');
    if(lb){var bar=lb.closest('.sp-engage-bar');if(bar)spToggleLike(bar.dataset.tag,bar);return;}

    var ct=e.target.closest('.sp-cmt-toggle');
    if(ct){
      var bar=ct.closest('.sp-engage-bar');
      if(!bar)return;
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
        spLoadComments(tag,sec);
        if(tag)spLoadEngagement(tag,bar);
      }
      return;
    }

    var sb=e.target.closest('.sp-cmt-send');
    if(sb){
      if(!spUser){spShowAuthModal();return;}
      var sec=sb.closest('.sp-cmt-section');if(!sec)return;
      var tag=sec.dataset.tag;
      var inp=sec.querySelector('.sp-cmt-input');
      if(!inp||!inp.value.trim())return;
      var bar=document.querySelector('.sp-engage-bar[data-tag="'+tag+'"]');
      spSubmitComment(tag,inp.value,sec,bar);
      return;
    }

    var lo=e.target.closest('.sp-logout-btn');
    if(lo){spSignOut();return;}

    var lh=e.target.closest('.sp-login-hint');
    if(lh){spShowAuthModal();return;}
  });

  document.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&e.target.classList.contains('sp-cmt-input')){
      var sec=e.target.closest('.sp-cmt-section');if(!sec)return;
      if(!spUser){spShowAuthModal();return;}
      var tag=sec.dataset.tag;
      if(!e.target.value.trim())return;
      var bar=document.querySelector('.sp-engage-bar[data-tag="'+tag+'"]');
      spSubmitComment(tag,e.target.value,sec,bar);
    }
  });
});
