/* ============ S1L Info-Hub — globaler Sprach-Umschalter (DE/EN/TR/RU) ============
   Zeigt oben rechts einen DE/EN/TR/RU-Schalter. Wahl bleibt gespeichert (localStorage).
   Übersetzt wird über Geschwister-Gruppen:
     <span class="lng-de">..</span><span class="lng-en">..</span>[<span class="lng-tr">..</span>][<span class="lng-ru">..</span>]
   (oder die Klassen lng-de/lng-en/lng-tr/lng-ru auf Block-Elementen).

   FALLBACK-KETTE: Fehlt für die gewählte Sprache eine Übersetzung, wird die nächste
   verfügbare gezeigt — TR/RU fallen auf EN, dann DE. So bleibt nie etwas leer, solange
   die TR/RU-Texte noch nicht überall ergänzt sind. Standardsprache = Deutsch. */
(function(){
  var LANGS=['de','en','tr','ru'];
  var LABEL={de:'DE',en:'EN',tr:'TR',ru:'RU'};
  /* Reihenfolge der Fallbacks je gewählter Sprache */
  var PRIO={
    de:['de','en','tr','ru'],
    en:['en','de','tr','ru'],
    tr:['tr','en','de','ru'],
    ru:['ru','en','de','tr']
  };

  function lcode(el){
    if(!el || el.nodeType!==1 || !el.classList) return null;
    var cl=el.classList;
    for(var i=0;i<cl.length;i++){ if(cl[i].indexOf('lng-')===0) return cl[i].slice(4); }
    return null;
  }
  function isLng(n){ return lcode(n)!==null; }

  /* Sammelt Gruppen: maximale Läufe aufeinanderfolgender lng-* Geschwister.
     Eine Gruppe endet, sobald eine Sprache erneut auftaucht (= nächste Gruppe). */
  function buildGroups(){
    var all=document.querySelectorAll('[class*="lng-"]');
    var done=[], out=[];
    function marked(el){ for(var i=0;i<done.length;i++){ if(done[i]===el) return true; } return false; }
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(lcode(el)===null || marked(el)) continue;
      /* zum Gruppenstart nach links laufen */
      var start=el;
      while(isLng(start.previousElementSibling)) start=start.previousElementSibling;
      /* von links nach rechts einsammeln, bei Sprach-Wiederholung neue Gruppe */
      var grp=[], seen={}, cur=start;
      while(isLng(cur)){
        var c=lcode(cur);
        if(seen[c]){ out.push(grp); grp=[]; seen={}; }
        grp.push(cur); seen[c]=true; done.push(cur);
        cur=cur.nextElementSibling;
      }
      if(grp.length) out.push(grp);
    }
    return out;
  }

  var GROUPS=null;
  function apply(l){
    if(LANGS.indexOf(l)<0) l='de';
    document.documentElement.setAttribute('data-lang', l);
    document.documentElement.lang=l;
    try{ localStorage.setItem('s1l_lang', l); }catch(e){}
    if(!GROUPS) GROUPS=buildGroups();
    var prio=PRIO[l];
    for(var g=0; g<GROUPS.length; g++){
      var grp=GROUPS[g], avail={};
      for(var i=0;i<grp.length;i++) avail[lcode(grp[i])]=true;
      var pick=null;
      for(var p=0;p<prio.length;p++){ if(avail[prio[p]]){ pick=prio[p]; break; } }
      for(var j=0;j<grp.length;j++){ grp[j].classList.toggle('lng-off', lcode(grp[j])!==pick); }
    }
    var bs=document.querySelectorAll('#langtoggle button');
    for(var k=0;k<bs.length;k++){ bs[k].classList.toggle('on', bs[k].getAttribute('data-l')===l); }
    /* Mobile-Handle zeigt die aktuelle Sprache (eingeklappter Zustand). */
    var hl=document.querySelector('#langtoggle .langhandle-lbl'); if(hl) hl.textContent=LABEL[l]||String(l).toUpperCase();
    /* „Ungeprüft"-Hinweis: erscheint NUR für TR/RU (maschinell übersetzt, von Muttersprachlern zu prüfen). */
    var note=document.getElementById('langnote');
    if(note){ var NT={tr:'⚠️ Makine çevirisi — henüz doğrulanmadı.', ru:'⚠️ Машинный перевод — ещё не проверено.'};
      if(NT[l]){ note.textContent=NT[l]; note.removeAttribute('hidden'); } else { note.setAttribute('hidden',''); } }
    /* Tool-Seiten (Raid/Templates) hören darauf, um ihren JS-Generator mitzuschalten. */
    try{ document.dispatchEvent(new CustomEvent('s1l:lang',{detail:l})); }catch(e){}
  }
  /* Damit der seiteneigene Schalter (segLang) denselben Mechanismus auslösen kann. */
  window.S1LapplyLang=apply;

  function init(){
    if(!document.getElementById('langtoggle')){
      var d=document.createElement('div');
      d.id='langtoggle'; d.setAttribute('role','group');
      d.setAttribute('aria-label','Sprache / Language / Dil / Язык');
      var html='<button type="button" class="langhandle" aria-expanded="false" aria-label="Sprache wählen / choose language">🌐 <span class="langhandle-lbl">DE</span></button>';
      for(var i=0;i<LANGS.length;i++){ html+='<button type="button" data-l="'+LANGS[i]+'">'+LABEL[LANGS[i]]+'</button>'; }
      d.innerHTML=html;
      document.body.appendChild(d);
      d.addEventListener('click', function(e){
        var b=e.target.closest ? e.target.closest('button') : (e.target.tagName==='BUTTON'?e.target:null);
        if(!b) return;
        if(b.classList.contains('langhandle')){
          var open=document.documentElement.classList.toggle('lang-open');
          b.setAttribute('aria-expanded', open?'true':'false');
          return;
        }
        var l=b.getAttribute('data-l');
        if(l){ apply(l);
          document.documentElement.classList.remove('lang-open');
          var h=d.querySelector('.langhandle'); if(h) h.setAttribute('aria-expanded','false');
        }
      });
      /* Tippen ausserhalb schliesst das aufgeklappte Sprachmenue (mobil). */
      document.addEventListener('click', function(e){
        if(!document.documentElement.classList.contains('lang-open')) return;
        if(e.target.closest && e.target.closest('#langtoggle')) return;
        document.documentElement.classList.remove('lang-open');
        var h=d.querySelector('.langhandle'); if(h) h.setAttribute('aria-expanded','false');
      });
    }
    if(!document.getElementById('langnote')){
      var n=document.createElement('div');
      n.id='langnote'; n.setAttribute('role','note'); n.setAttribute('hidden','');
      document.body.appendChild(n);
    }
    var saved='de'; try{ saved=localStorage.getItem('s1l_lang')||'de'; }catch(e){}
    apply(saved);
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
