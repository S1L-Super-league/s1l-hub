/* ============ S1L Info-Hub — R4-editierbare Kacheln (content.js) ============
   Macht Info-Kacheln (.card / .today) für R4 editierbar: ✏️ ändern · ➕ neu · 🗑 entfernen.
   - Nur R4 (sessionStorage s1l_r4_ok) sieht die Knöpfe; Mitglieder sehen nur den Text.
   - R4 schreibt in EINER Sprache; der Cloudflare-Worker (Claude Haiku) übersetzt in DE/EN/TR/RU.
   - Original-Sprache = geprüft; TR/RU tragen (über lang.js) den „maschinell"-Hinweis.
   - Gespeichert in Firestore-Sammlung 'content' (Doc-Id = cid = seite#index). Live über onSnapshot.
   - Versionierung: je Änderung wird der Vorwert (prev_*) mitgesichert → „−"/Überschreiben rückholbar.
   - Bild-Upload folgt, sobald der Storage-Bucket steht (STORAGE_READY).
   Einbinden NUR auf Mitglieder-Info-Seiten (NICHT Feedback/Mitmachen, NICHT Glossar):
     <script src="content.js"></script>   (lädt Firebase bei Bedarf selbst nach; nach lang.js einbinden) */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var TRANSLATE_URL="https://s1l-translate.jacqueline-lex.workers.dev";
  var STORAGE_READY=false;  // auf true, sobald der Storage-Bucket + Regeln stehen (Bild-Upload)
  var PRIO={de:['de','en','tr','ru'],en:['en','de','tr','ru'],tr:['tr','en','de','ru'],ru:['ru','en','de','tr']};
  var pageKey=(location.pathname.split('/').pop()||'index').replace(/\.html?$/,'');
  var DATA={}, col=null, wrapEl=null;

  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  function editorName(){ try{ return sessionStorage.getItem('s1l_r4_name')||'R4'; }catch(e){ return 'R4'; } }
  function curLang(){ try{ var l=localStorage.getItem('s1l_lang'); if(l) return l; }catch(e){} return document.documentElement.getAttribute('data-lang')||'de'; }
  function esc(t){ var d=document.createElement('div'); d.textContent=(t==null?'':t); return d.innerHTML; }
  function txt2html(t){ return esc(t).replace(/\n/g,'<br>'); }
  function pick(doc){ var o=PRIO[curLang()]||PRIO.de; for(var i=0;i<o.length;i++){ var v=doc['t_'+o[i]]; if(v) return v; } return doc.t_orig||''; }

  /* Sichtbaren Text (aktuelle Sprache) einer Kachel für die Vorbelegung des Editors holen. */
  function plainOf(el){
    var b=el.querySelector('.c-body')||el;
    return (b.innerText||b.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
  }

  /* Editierbare Kacheln finden: Inhalts-Karten + HEUTE-Block, KEINE Navigations-Karten/Legende. */
  function tiles(){
    var out=[];
    document.querySelectorAll('.today, .card').forEach(function(el){
      if(el.closest('a.cardlink')) return;      // Navigations-Kacheln nicht editierbar
      if(el.closest('.legend')) return;
      out.push(el);
    });
    return out;
  }

  var TILES=[];
  function prepare(){
    wrapEl=document.querySelector('.wrap')||document.body;
    TILES=tiles();
    TILES.forEach(function(el,i){
      if(!el.getAttribute('data-cid')) el.setAttribute('data-cid', pageKey+'#'+i);
      if(!el.querySelector('.c-body')){
        var b=document.createElement('div'); b.className='c-body';
        while(el.firstChild) b.appendChild(el.firstChild);
        el.appendChild(b);
        el.setAttribute('data-default', b.innerHTML);
      }
    });
  }

  function tileEls(){ return Array.prototype.slice.call(document.querySelectorAll('[data-cid]')); }

  function render(){
    // Bestehende HTML-Kacheln
    TILES.forEach(function(el){
      var cid=el.getAttribute('data-cid'), doc=DATA[cid], body=el.querySelector('.c-body');
      if(!body) return;
      if(doc && doc.deleted){ el.style.display='none'; }
      else { el.style.display=''; body.innerHTML = doc ? txt2html(pick(doc)) : el.getAttribute('data-default'); }
      controls(el);
    });
    // DB-only „hinzugefügte" Kacheln (added:true) unten im Wrap anzeigen
    Object.keys(DATA).forEach(function(cid){
      var doc=DATA[cid];
      if(!doc.added || doc.deleted) return;
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]');
      if(!el){
        el=document.createElement('div'); el.className='card'; el.setAttribute('data-cid',cid);
        var b=document.createElement('div'); b.className='c-body'; el.appendChild(b);
        if(wrapEl){ var ft=wrapEl.querySelector('footer'); wrapEl.insertBefore(el, ft||null); }
      }
      el.style.display=''; el.querySelector('.c-body').innerHTML=txt2html(pick(doc));
      controls(el);
    });
  }
  function cssq(s){ return s.replace(/(["\\#])/g,'\\$1'); }

  /* R4-Werkzeugleiste je Kachel */
  function controls(el){
    var bar=el.querySelector('.c-bar');
    if(!isR4()){ if(bar) bar.remove(); return; }
    if(bar) return;
    el.style.position=el.style.position||'relative';
    bar=document.createElement('div'); bar.className='c-bar';
    var isToday=el.classList.contains('today');
    bar.innerHTML='<button type="button" class="c-btn c-edit" title="ändern">✏️</button>'+
                  (isToday?'':'<button type="button" class="c-btn c-del" title="entfernen">🗑</button>');
    el.insertBefore(bar, el.firstChild);
    bar.querySelector('.c-edit').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openEditor(el); });
    var d=bar.querySelector('.c-del'); if(d) d.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); removeTile(el); });
  }

  function addButton(){
    if(!isR4() || !wrapEl) return;
    if(document.getElementById('c-add')) return;
    var btn=document.createElement('button');
    btn.id='c-add'; btn.type='button'; btn.className='c-addbtn';
    btn.textContent='➕ neue Info-Kachel';
    var h=wrapEl.querySelector('header'); if(h) h.insertAdjacentElement ? h.insertAdjacentElement('afterend', btn) : wrapEl.insertBefore(btn, h.nextSibling);
    else wrapEl.insertBefore(btn, wrapEl.firstChild);
    btn.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
  }

  function openEditor(el){
    if(el.querySelector('.c-editor')) return;
    var cid=el.getAttribute('data-cid'), doc=DATA[cid];
    var body=el.querySelector('.c-body'); if(body) body.style.display='none';
    var start = doc ? (doc.t_orig||pick(doc)) : plainOf(el);
    var isStrat = /strat|allianzduell|powerplay|event/i.test(pageKey);
    var box=document.createElement('div'); box.className='c-editor';
    box.innerHTML=(isStrat?'<p class="c-warn">⚠️ Achtung: ändert auch die Strategie.</p>':'')+
      '<textarea class="c-ta" rows="5">'+esc(start)+'</textarea>'+
      '<div class="c-note">Schreib in deiner Sprache — wird automatisch in DE/EN/TR/RU übersetzt.</div>'+
      '<div class="c-row"><button type="button" class="c-save">Speichern</button><button type="button" class="c-cancel">Abbrechen</button><span class="c-msg"></span></div>';
    el.appendChild(box);
    var ta=box.querySelector('.c-ta'); ta.focus();
    box.querySelector('.c-cancel').addEventListener('click', function(){ box.remove(); if(body) body.style.display=''; if(doc&&doc.added&&!doc.t_orig){ delete DATA[cid]; var e2=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(e2&&!el.getAttribute('data-default')) e2.remove(); } });
    box.querySelector('.c-save').addEventListener('click', function(){
      var text=ta.value.trim(); var msg=box.querySelector('.c-msg'); var btn=box.querySelector('.c-save');
      if(!text){ msg.textContent='Bitte Text eingeben.'; return; }
      btn.disabled=true; msg.textContent='übersetze…';
      translate(text, function(tr){
        var prev=DATA[cid]||{};
        var nd={ cid:cid, t_orig:text, orig_lang:curLang(), editor:editorName(), tms:Date.now(),
                 t_de:(tr&&tr.de)||'', t_en:(tr&&tr.en)||'', t_tr:(tr&&tr.tr)||'', t_ru:(tr&&tr.ru)||'',
                 prev_orig:prev.t_orig||'', prev_lang:prev.orig_lang||'', prev_editor:prev.editor||'', prev_tms:prev.tms||0 };
        if(prev.added) nd.added=true;
        if(!(tr&&(tr.de||tr.en||tr.tr||tr.ru))){ nd['t_'+curLang()]=text; } // Worker aus → Original in aktueller Sprache
        save(cid, nd, function(ok){ if(ok){ box.remove(); if(body) body.style.display=''; } else { btn.disabled=false; msg.textContent='Fehler beim Speichern.'; } });
      });
    });
  }

  function removeTile(el){
    var cid=el.getAttribute('data-cid'), prev=DATA[cid]||{};
    if(!confirm('Diese Kachel entfernen? (rückholbar über die Versionierung)')) return;
    var nd={ cid:cid, deleted:true, editor:editorName(), tms:Date.now(),
             t_orig:prev.t_orig||'', orig_lang:prev.orig_lang||'', t_de:prev.t_de||'', t_en:prev.t_en||'', t_tr:prev.t_tr||'', t_ru:prev.t_ru||'',
             prev_orig:prev.t_orig||'', prev_lang:prev.orig_lang||'', prev_editor:prev.editor||'', prev_tms:prev.tms||0 };
    if(prev.added) nd.added=true;
    save(cid, nd, function(){});
  }

  function translate(text, cb){
    try{ fetch(TRANSLATE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text})})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(j){ cb(j&&(j.de||j.en||j.tr||j.ru)?j:null); })
      .catch(function(){ cb(null); }); }catch(e){ cb(null); }
  }
  function save(cid, doc, cb){
    DATA[cid]=doc; render();
    if(col){ col.doc(cid).set(doc).then(function(){ cb(true); }).catch(function(){ cb(false); }); }
    else { cb(true); }  // ohne DB nur lokal (Vorschau)
  }

  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){
    if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); });
  }
  function boot(){
    prepare(); render(); addButton();
    document.addEventListener('s1l:lang', function(){ render(); });
    initFb(function(){ try{ if(typeof firebase!=='undefined'){ if(!firebase.apps.length) firebase.initializeApp(FB);
      col=firebase.firestore().collection('content');
      col.onSnapshot(function(s){ DATA={}; s.forEach(function(d){ DATA[d.id]=d.data()||{}; }); render(); addButton(); },
        function(){ col=null; }); } }catch(e){ col=null; } });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
