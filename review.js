/* ============ S1L Info-Hub — EINZIGES Label-System: Informations-Prüfung ============
   4 Stufen: falsch · unsicher · bereit zur Prüfung · freigegeben.
   - Wandelt alte Tier-Badges (.badge.tier-fix/prob/test) automatisch in Review-Chips um
     (fix→freigegeben, prob→bereit, test→unsicher) — die alte Form taucht nicht mehr auf.
   - Chips sind anklickbar + GETEILT über Firebase-Collection 'reviews' (Fallback: lokal).
   - „freigegeben" darf nur R4 setzen (sessionStorage s1l_r4_ok).
   - In einer .legend werden Badges nur umbenannt (statisch), nicht interaktiv.
   Einbinden: <script src="review.js"></script> (lädt Firebase bei Bedarf selbst nach). */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var ORDER=["falsch","unsicher","bereit","frei"];
  var DE={falsch:"falsch",unsicher:"unsicher",bereit:"bereit zur Prüfung",frei:"freigegeben"};
  var MAP={fix:"frei",prob:"bereit",test:"unsicher"};
  var cache={}, col=null;
  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  var pageKey=(location.pathname.split('/').pop()||'index');
  function convert(){
    var idx=0;
    document.querySelectorAll('.badge.tier-fix,.badge.tier-prob,.badge.tier-test').forEach(function(el){
      var m=el.className.match(/tier-(fix|prob|test)/); var st=MAP[m?m[1]:'test']||'unsicher';
      var inLegend=!!el.closest('.legend');
      el.classList.remove('badge','tier-fix','tier-prob','tier-test'); el.classList.add('rev');
      if(inLegend){ el.classList.add('rev-'+st,'rev-static'); el.textContent=DE[st]; return; }
      el.setAttribute('data-rev', pageKey+'#'+(idx++)); el.setAttribute('data-default', st);
    });
  }
  function renderChips(){
    document.querySelectorAll('.rev[data-rev]').forEach(function(el){
      var id=el.getAttribute('data-rev'); var st=cache[id]||el.getAttribute('data-default')||'unsicher';
      el.className='rev rev-'+st; el.textContent=DE[st]; el.title= isR4()?'Status weiterschalten (R4)':'Prüf-Status'; el.style.cursor= isR4()?'pointer':'default';
    });
  }
  function setStatus(id,st){ cache[id]=st; if(col){ col.doc(id).set({s:st,t:Date.now()}).catch(function(){ saveLocal(); }); } else { saveLocal(); } renderChips(); }
  function saveLocal(){ try{ localStorage.setItem('s1l_reviews', JSON.stringify(cache)); }catch(e){} }
  function cycle(el){ var id=el.getAttribute('data-rev'); var cur=cache[id]||el.getAttribute('data-default')||'unsicher';
    var ni=(ORDER.indexOf(cur)+1)%ORDER.length, nx=ORDER[ni];
    if(nx==='frei' && !isR4()){ ni=(ni+1)%ORDER.length; nx=ORDER[ni]; }
    setStatus(id,nx); }
  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){
    if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); });
  }
  function boot(){
    convert();
    try{ Object.assign(cache, JSON.parse(localStorage.getItem('s1l_reviews')||'{}')); }catch(e){}
    renderChips();
    initFb(function(){ try{ if(typeof firebase!=='undefined'){ if(!firebase.apps.length) firebase.initializeApp(FB);
      col=firebase.firestore().collection('reviews');
      col.onSnapshot(function(s){ s.forEach(function(d){ cache[d.id]=(d.data()||{}).s; }); renderChips(); }, function(){ col=null; }); } }catch(e){ col=null; } });
    document.addEventListener('click',function(e){ var el=e.target.closest('.rev[data-rev]'); if(el && isR4()) cycle(el); });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
