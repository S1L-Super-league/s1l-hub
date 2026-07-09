/* ============ S1L Info-Hub — R4-editierbare Kacheln (content.js) ============
   Macht Info-Kacheln (.card) für R4 editierbar: ✏️ ändern · ➕ neu · 🗑 entfernen.
   - Nur R4 (sessionStorage s1l_r4_ok) sieht die Knöpfe; Mitglieder sehen nur den Text.
   - R4 schreibt in EINER Sprache; der Cloudflare-Worker (Claude Haiku) übersetzt in DE/EN/TR/RU.
   - Gespeichert in Firestore-Sammlung 'content' (Doc-Id = cid = seite#index). Live über onSnapshot.
   - Versionierung: je Änderung Vorwert (prev_*) mitgesichert → „−"/Überschreiben rückholbar.
   - WICHTIG: Unbearbeitete Kacheln bleiben unangetastet (lang.js/DE-EN-TR-RU bleibt intakt);
     erst wenn R4 eine Kachel speichert, übernimmt content.js deren Text (einsprachig + Auto-Übersetzung).
   - Der HEUTE-Block (.today) ist bewusst AUSGENOMMEN (wird von engine.js gerollt; „Heute steht an" folgt separat).
   - Bild-Upload folgt, sobald der Storage-Bucket steht (STORAGE_READY).
   Einbinden NUR auf Mitglieder-Info-Seiten (NICHT Feedback/Mitmachen, NICHT Glossar), nach lang.js. */
(function(){
  var FB={ apiKey:"AIzaSyCeKoPKOVYKbN0OHkr3_T_nQwDtCALZD18", authDomain:"s1l-hub.firebaseapp.com", projectId:"s1l-hub", storageBucket:"s1l-hub.firebasestorage.app", messagingSenderId:"761448020039", appId:"1:761448020039:web:b65a7e1c1bac2f31831962" };
  var TRANSLATE_URL="https://s1l-translate.jacqueline-lex.workers.dev";
  var STORAGE_READY=false;  // true, sobald Storage-Bucket + Regeln stehen (Bild-Upload)
  var PRIO={de:['de','en','tr','ru'],en:['en','de','tr','ru'],tr:['tr','en','de','ru'],ru:['ru','en','de','tr']};
  function qp(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } }
  var rawPage=(location.pathname.split('/').pop()||'index').replace(/\.html?$/,'');
  var isDynPage=(rawPage==='seite');
  var pageKey=isDynPage ? (qp('p')||'seite') : rawPage;   // generische Seite: Namensraum aus ?p=
  var DATA={}, col=null, wrapEl=null, TILES=[];

  function isR4(){ try{ return sessionStorage.getItem('s1l_r4_ok')==='1'; }catch(e){ return false; } }
  function editorName(){ try{ return sessionStorage.getItem('s1l_r4_name')||'R4'; }catch(e){ return 'R4'; } }
  function curLang(){ try{ var l=localStorage.getItem('s1l_lang'); if(l) return l; }catch(e){} return document.documentElement.getAttribute('data-lang')||'de'; }
  /* Übersetzungen der R4-Bedien-Elemente (Buttons, Editor, Tooltips) */
  var UI={
    add:{de:'➕ Info-Kachel (immer offen)',en:'➕ Info tile (always open)',tr:'➕ Bilgi kartı (her zaman açık)',ru:'➕ Инфо-плитка (всегда открыта)'},
    addcollap:{de:'➕ aufklappbare Kachel (mit Überschrift)',en:'➕ Collapsible tile (with heading)',tr:'➕ Açılır kart (başlıklı)',ru:'➕ Раскрывающаяся плитка (с заголовком)'},
    addpage:{de:'➕ Seite (Kachel → Seite)',en:'➕ Page (tile → page)',tr:'➕ Sayfa (kart → sayfa)',ru:'➕ Страница (плитка → страница)'},
    up:{de:'hoch schieben',en:'move up',tr:'yukarı taşı',ru:'вверх'},
    down:{de:'runter schieben',en:'move down',tr:'aşağı taşı',ru:'вниз'},
    edit:{de:'ändern',en:'edit',tr:'düzenle',ru:'изменить'},
    del:{de:'entfernen',en:'remove',tr:'kaldır',ru:'удалить'},
    save:{de:'Speichern',en:'Save',tr:'Kaydet',ru:'Сохранить'},
    cancel:{de:'Abbrechen',en:'Cancel',tr:'İptal',ru:'Отмена'},
    translating:{de:'übersetze…',en:'translating…',tr:'çevriliyor…',ru:'перевод…'},
    shrinking:{de:'Bild wird verkleinert…',en:'shrinking image…',tr:'görsel küçültülüyor…',ru:'сжатие изображения…'},
    needtext:{de:'Bitte Text eingeben.',en:'Please enter text.',tr:'Lütfen metin girin.',ru:'Введите текст.'},
    toobig:{de:'Bild zu groß — bitte kleineres wählen.',en:'Image too large — pick a smaller one.',tr:'Görsel çok büyük — daha küçük seç.',ru:'Изображение слишком большое — выберите меньше.'},
    saveerr:{de:'Fehler beim Speichern.',en:'Error while saving.',tr:'Kaydederken hata.',ru:'Ошибка при сохранении.'},
    warn:{de:'⚠️ Achtung: ändert auch die Strategie.',en:'⚠️ Note: this also changes the strategy.',tr:'⚠️ Dikkat: stratejiyi de değiştirir.',ru:'⚠️ Внимание: меняет и стратегию.'},
    notePage:{de:'Name der neuen Seite — wird in alle Sprachen übersetzt. Die Kachel wird anklickbar und führt auf die neue Seite.',en:'Name of the new page — translated into all languages. The tile becomes clickable and opens the page.',tr:'Yeni sayfanın adı — tüm dillere çevrilir. Kart tıklanabilir olur ve sayfayı açar.',ru:'Название новой страницы — переводится на все языки. Плитка станет кликабельной и откроет страницу.'},
    noteCollap:{de:'Erste Zeile = Überschrift (zum Aufklappen), danach der Text. Wird in alle Sprachen übersetzt.',en:'First line = heading (to expand), then the text. Translated into all languages.',tr:'İlk satır = başlık (açmak için), sonra metin. Tüm dillere çevrilir.',ru:'Первая строка = заголовок (для раскрытия), затем текст. Переводится на все языки.'},
    noteText:{de:'Schreib in deiner Sprache — wird automatisch in DE/EN/TR/RU übersetzt.',en:'Write in your language — auto-translated into DE/EN/TR/RU.',tr:'Kendi dilinde yaz — otomatik DE/EN/TR/RU çevrilir.',ru:'Пиши на своём языке — авто-перевод на DE/EN/TR/RU.'},
    img:{de:'📎 Bild:',en:'📎 Image:',tr:'📎 Görsel:',ru:'📎 Изображение:'},
    imgnote:{de:'Nur Spiel-Bezug (Screenshots/Grafiken) — keine privaten Fotos.',en:'Game-related only (screenshots/graphics) — no private photos.',tr:'Sadece oyunla ilgili (ekran/grafik) — özel fotoğraf yok.',ru:'Только по игре (скриншоты/графика) — без личных фото.'},
    imgdel:{de:'Bild entfernen',en:'Remove image',tr:'Görseli kaldır',ru:'Убрать изображение'},
    phPage:{de:'Name der Seite, z. B. Turbo-Guide',en:'Page name, e.g. Turbo guide',tr:'Sayfa adı, örn. Turbo rehberi',ru:'Название страницы, напр. Turbo-гайд'},
    phCollap:{de:'Überschrift (1. Zeile), danach der Text',en:'Heading (line 1), then the text',tr:'Başlık (1. satır), sonra metin',ru:'Заголовок (1-я строка), затем текст'},
    fH1:{de:'Überschrift 1',en:'Heading 1',tr:'Başlık 1',ru:'Заголовок 1'},
    fH2:{de:'Überschrift 2',en:'Heading 2',tr:'Başlık 2',ru:'Заголовок 2'},
    fBold:{de:'Fett',en:'Bold',tr:'Kalın',ru:'Жирный'},
    fList:{de:'Aufzählung',en:'List',tr:'List',ru:'Список'},
    confirmDel:{de:'Diese Kachel entfernen? (rückholbar über die Versionierung)',en:'Remove this tile? (recoverable via versioning)',tr:'Bu kart kaldırılsın mı? (sürümleme ile geri alınabilir)',ru:'Убрать плитку? (можно вернуть через версии)'},
    newpage:{de:'(neue Seite)',en:'(new page)',tr:'(yeni sayfa)',ru:'(новая страница)'},
    heading:{de:L('heading'),en:'(heading)',tr:'(başlık)',ru:'(заголовок)'}
  };
  function L(k){ var o=UI[k]||{}; return o[curLang()]||o.de||''; }
  function esc(t){ var d=document.createElement('div'); d.textContent=(t==null?'':t); return d.innerHTML; }
  function txt2html(t){ return esc(t).replace(/\n/g,'<br>'); }
  /* Mini-Formatierung: # H1 · ## H2 · - Liste · **fett**. Übersteht die Auto-Übersetzung (Marker bleiben). */
  function mdInline(s){ return esc(s).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>'); }
  function mdToHtml(t){
    var lines=(t||'').split('\n'), out=[], inUl=false;
    function closeUl(){ if(inUl){ out.push('</ul>'); inUl=false; } }
    for(var i=0;i<lines.length;i++){ var ln=lines[i];
      if(/^\s*[-*]\s+/.test(ln)){ if(!inUl){ out.push('<ul>'); inUl=true; } out.push('<li>'+mdInline(ln.replace(/^\s*[-*]\s+/,''))+'</li>'); continue; }
      closeUl();
      if(/^##\s+/.test(ln)){ out.push('<h3 class="c-mh2">'+mdInline(ln.replace(/^##\s+/,''))+'</h3>'); continue; }
      if(/^#\s+/.test(ln)){ out.push('<h2 class="c-mh1">'+mdInline(ln.replace(/^#\s+/,''))+'</h2>'); continue; }
      if(ln.trim()===''){ out.push('<br>'); continue; }
      out.push('<p>'+mdInline(ln)+'</p>');
    }
    closeUl(); return out.join('');
  }
  function taWrap(ta,b,a){ var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value; ta.value=v.slice(0,s)+b+v.slice(s,e)+(a||'')+v.slice(e); ta.focus(); ta.selectionStart=s+b.length; ta.selectionEnd=e+b.length; }
  function taPrefix(ta,p){ var s=ta.selectionStart,v=ta.value,ls=v.lastIndexOf('\n',s-1)+1; ta.value=v.slice(0,ls)+p+v.slice(ls); ta.focus(); ta.selectionStart=ta.selectionEnd=s+p.length; }
  function taInsert(ta,t){ var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value; ta.value=v.slice(0,s)+t+v.slice(e); ta.focus(); ta.selectionStart=ta.selectionEnd=s+t.length; }
  /* Präfix (z. B. „- ", „# ") auf ALLE markierten Zeilen setzen (nicht nur die erste). */
  function taLinePrefix(ta,p){
    var v=ta.value, s=ta.selectionStart, e=ta.selectionEnd;
    var ls=v.lastIndexOf('\n',s-1)+1, le=v.indexOf('\n',e); if(le<0) le=v.length;
    var seg=v.slice(ls,le).split('\n').map(function(l){ return l.indexOf(p)===0 ? l : p+l; }).join('\n');
    ta.value=v.slice(0,ls)+seg+v.slice(le); ta.focus(); ta.selectionStart=ls; ta.selectionEnd=ls+seg.length;
  }
  function pick(doc){ var o=PRIO[curLang()]||PRIO.de; for(var i=0;i<o.length;i++){ var v=doc['t_'+o[i]]; if(v) return v; } return doc.t_orig||''; }
  function imgHtml(doc){ return doc.img?'<p><img src="'+doc.img+'" alt="Bild" style="max-width:100%;border-radius:10px"></p>':''; }

  /* Bild klein rechnen (wie der Blog): max ~1000px, JPEG ~0.7 -> als Daten-URL direkt in die DB.
     Kein Firebase Storage/Blaze nötig — bleibt gratis (Firestore-Limit 1 MB/Doc; verkleinert weit darunter). */
  function shrinkImage(file, cb){
    var fr=new FileReader();
    fr.onload=function(){ var img=new Image();
      img.onload=function(){ var max=1000, w=img.width, h=img.height;
        if(w>max||h>max){ if(w>h){ h=Math.round(h*max/w); w=max; } else { w=Math.round(w*max/h); h=max; } }
        var c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
        try{ cb(c.toDataURL('image/jpeg',0.7)); }catch(e){ cb(''); } };
      img.onerror=function(){ cb(''); }; img.src=fr.result; };
    fr.onerror=function(){ cb(''); }; fr.readAsDataURL(file);
  }

  /* Nur den Text der AKTUELLEN Sprache aus der Original-Kachel holen (für Editor-Vorbelegung). */
  function extractCurrentText(el){
    var cur=curLang(), clone=el.cloneNode(true);
    clone.querySelectorAll('.c-bar,.c-editor,.go,.badge,.rev').forEach(function(n){ n.remove(); });
    // Fremdsprachen-Spans entfernen (robust, auch falls lang.js sie nicht per .lng-off versteckt hat)
    clone.querySelectorAll('[class*="lng-"]').forEach(function(n){ var m=n.className.match(/lng-(de|en|tr|ru)/); if(m && m[1]!==cur) n.remove(); });
    clone.querySelectorAll('p,div,li,h1,h2,h3,br,summary').forEach(function(n){ n.appendChild(document.createTextNode('\n')); });
    return (clone.textContent||'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  /* Editierbare Kacheln: Inhalts-Karten + Navigations-Karten (Link bleibt, nur ändern).
     Ausgenommen: Legende, HEUTE-Block, sowie Nav-Karten zu Mitmachen/Glossar. */
  function isNav(el){ return !!el.closest('a.cardlink'); }
  function isDetails(el){ return el.tagName==='DETAILS'; }
  function tiles(){
    var out=[];
    document.querySelectorAll('.card, details').forEach(function(el){
      if(el.closest('.legend')) return;
      var a=el.closest('a.cardlink');
      if(a && /S1L-Mitmachen|howto/i.test(a.getAttribute('href')||'')) return;  // Feedback/Glossar ausgenommen
      var dp=el.closest('details'); if(dp && dp!==el) return;  // keine Kachel innerhalb eines aufklappbaren Blocks doppelt zählen
      out.push(el);
    });
    return out;
  }
  function cssq(s){ return s.replace(/(["\\#\.\/])/g,'\\$1'); }

  function prepare(){
    wrapEl=document.querySelector('.wrap')||document.body;
    TILES=tiles();
    TILES.forEach(function(el,i){ if(!el.getAttribute('data-cid')) el.setAttribute('data-cid', pageKey+'#'+i); });
  }

  function controls(el){
    if(!isR4()){ var b0=el.querySelector('.c-bar'); if(b0) b0.remove(); return; }
    if(el.querySelector('.c-bar')) return;
    if(getComputedStyle(el).position==='static') el.style.position='relative';
    var nav=isNav(el);  // Navigations-Kacheln: nur ändern, kein Entfernen (Link bleibt)
    var bar=document.createElement('div'); bar.className='c-bar';
    bar.innerHTML='<button type="button" class="c-btn c-up" title="'+L('up')+'">▲</button>'+
                  '<button type="button" class="c-btn c-down" title="'+L('down')+'">▼</button>'+
                  '<button type="button" class="c-btn c-edit" title="'+L('edit')+'">✏️</button>'+
                  (nav?'':'<button type="button" class="c-btn c-del" title="'+L('del')+'">🗑</button>');
    var host=(isDetails(el) && el.querySelector('summary')) ? el.querySelector('summary') : el;  // bei aufklappbaren: Leiste in die Überschrift, damit sie auch zugeklappt sichtbar ist
    host.insertBefore(bar, host.firstChild);
    bar.querySelector('.c-up').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); move(el,-1); });
    bar.querySelector('.c-down').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); move(el,1); });
    bar.querySelector('.c-edit').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); openEditor(el); });
    var d=bar.querySelector('.c-del'); if(d) d.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); removeTile(el); });
  }

  /* ==== Reihenfolge: Kacheln hoch/runter schieben (R4), in Firestore-Doc <seite>#__order gemerkt ==== */
  function currentSeq(){
    var seq=[]; document.querySelectorAll('[data-cid]').forEach(function(t){ var c=t.getAttribute('data-cid'); if(c && c.indexOf('#__order')<0) seq.push(c); }); return seq;
  }
  function move(el, dir){
    var cid=el.getAttribute('data-cid'), seq=currentSeq(), i=seq.indexOf(cid), j=i+dir;
    if(i<0 || j<0 || j>=seq.length) return;
    var t=seq[i]; seq[i]=seq[j]; seq[j]=t;
    var od={ cid:pageKey+'#__order', ord:seq, editor:editorName(), tms:Date.now() };
    DATA[pageKey+'#__order']=od; render();
    if(col) col.doc(pageKey+'#__order').set(od).catch(function(){});
  }
  function applyOrder(){
    var od=DATA[pageKey+'#__order']; if(!od || !od.ord || !od.ord.length) return;
    var ord=od.ord, groups=[];
    document.querySelectorAll('[data-cid]').forEach(function(t){ var c=t.getAttribute('data-cid'); if(c.indexOf('#__order')>=0) return;
      var b=t.closest('a.cardlink')||t, g=null;
      for(var i=0;i<groups.length;i++){ if(groups[i].p===b.parentNode){ g=groups[i]; break; } }
      if(!g){ g={p:b.parentNode, items:[]}; groups.push(g); } g.items.push({b:b,c:c});
    });
    groups.forEach(function(g){
      if(g.items.length<2) return;
      var nodes=g.items.map(function(x){return x.b;});
      var sorted=g.items.slice().sort(function(a,b){ var ia=ord.indexOf(a.c), ib=ord.indexOf(b.c); if(ia<0)ia=1e6; if(ib<0)ib=1e6; return ia-ib; }).map(function(x){return x.b;});
      var same=true; for(var i=0;i<nodes.length;i++){ if(nodes[i]!==sorted[i]){ same=false; break; } }
      if(same) return;
      var phs=nodes.map(function(n){ var ph=document.createComment('o'); g.p.replaceChild(ph,n); return ph; });
      for(var j=0;j<phs.length;j++){ g.p.replaceChild(sorted[j], phs[j]); }
    });
  }

  function renderTile(el){
    var cid=el.getAttribute('data-cid'), doc=DATA[cid];
    if(doc && doc.deleted){ el.style.display='none'; return; }
    el.style.display='';
    if(doc){
      if(isNav(el)){
        // Navigations-Kachel: Link + „Öffnen →" behalten, nur Titel/Text ersetzen (1. Zeile = Titel)
        var go=el.querySelector('.go'), goHTML=go?go.outerHTML:'';
        var parts=pick(doc).split('\n').filter(function(s){return s.trim();});
        var title=parts.shift()||''; var rest=parts.join('<br>');
        el.innerHTML='<h3>'+esc(title)+'</h3>'+(rest?'<p>'+esc(rest)+'</p>':'')+imgHtml(doc)+goHTML;
      } else if(isDetails(el)){
        var dp=pick(doc).split('\n'), dh=(dp.shift()||L('heading')), db=dp.join('\n');  // aufklappbar: 1. Zeile = Überschrift
        el.innerHTML='<summary>'+esc(dh)+'</summary><div class="c-body">'+mdToHtml(db)+imgHtml(doc)+'</div>';
      } else {
        el.innerHTML='<div class="c-body">'+mdToHtml(pick(doc))+imgHtml(doc)+'</div>';  // editiert -> Text (+Bild)
      }
    }
    // ohne doc: Original-DOM unangetastet lassen (lang.js bleibt zuständig)
    controls(el);
  }

  function render(){
    TILES.forEach(renderTile);
    // DB-only „hinzugefügte" Kacheln unten im Wrap
    Object.keys(DATA).forEach(function(cid){
      var doc=DATA[cid]; if(!doc.added || doc.deleted) return;
      if(cid.indexOf(pageKey+'#')!==0) return;   // NUR Kacheln DIESER Seite anzeigen (Fix: Kachel blieb sonst auf allen Seiten)
      var isCollap=(doc.type==='collapsible');
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]');
      if(!el){ el=document.createElement('div'); el.className='card'; el.setAttribute('data-cid',cid);
        if(wrapEl){ var ft=wrapEl.querySelector('footer'); wrapEl.insertBefore(el, ft||null); } }
      el.style.display='';
      if(isCollap){ var parts=pick(doc).split('\n'), head=(parts.shift()||L('heading')), body=parts.join('\n');
        el.innerHTML='<div class="c-collhead">▸ '+esc(head)+'</div><div class="c-collbody" hidden>'+mdToHtml(body)+imgHtml(doc)+'</div>';
        (function(e2,h){ var hd=e2.querySelector('.c-collhead'); hd.addEventListener('click', function(){ var b=e2.querySelector('.c-collbody'); if(b.hasAttribute('hidden')){ b.removeAttribute('hidden'); hd.textContent='▾ '+h; } else { b.setAttribute('hidden',''); hd.textContent='▸ '+h; } }); })(el, head);
      }
      else { el.innerHTML='<div class="c-body">'+mdToHtml(pick(doc))+imgHtml(doc)+'</div>'; }
      controls(el);
    });
    // Seiten-Kacheln (type=pagelink) auf der Elternseite als klickbare Navigation
    Object.keys(DATA).forEach(function(cid){
      var doc=DATA[cid]; if(doc.type!=='pagelink' || doc.deleted) return;
      if(cid.indexOf(pageKey+'#')!==0) return;
      var el=document.querySelector('[data-cid="'+cssq(cid)+'"]');
      if(!el){ el=document.createElement('div'); el.setAttribute('data-cid',cid);
        if(wrapEl){ var ft=wrapEl.querySelector('footer'); wrapEl.insertBefore(el, ft||null); } }
      el.style.display=''; if(getComputedStyle(el).position==='static') el.style.position='relative';
      var title=pick(doc)||doc.t_orig||L('newpage');
      el.innerHTML='<a class="cardlink" href="seite.html?p='+encodeURIComponent(doc.target||'')+'"><div class="card" style="border-left:7px solid #7c3aed"><h3>📄 '+esc(title)+'</h3><p class="go">Öffnen →</p></div></a>';
      controls(el);
    });
    if(isDynPage) dynHeader();
    applyOrder();
  }

  /* Titel + Zurück-Link auf der generischen Seite (seite.html) aus der zugehörigen Seiten-Kachel. */
  function dynHeader(){
    var t=null; Object.keys(DATA).forEach(function(cid){ var d=DATA[cid]; if(d.type==='pagelink' && d.target===pageKey && !d.deleted) t=d; });
    var h=document.getElementById('p-title'); if(h) h.textContent='📄 '+(t?(pick(t)||t.t_orig||pageKey):pageKey);
    try{ document.title=(t?(t.t_orig||pick(t)):pageKey)+' — S1L Info-Hub'; }catch(e){}
  }

  function relabelBtns(){ var a=document.getElementById('c-add'); if(a)a.textContent=L('add'); var c=document.getElementById('c-addcollap'); if(c)c.textContent=L('addcollap'); var p=document.getElementById('c-addpage'); if(p)p.textContent=L('addpage'); }
  function addButton(){
    if(!isR4() || !wrapEl) return;
    var anchor=wrapEl.querySelector('header');
    function place(btn, afterEl){ if(afterEl && afterEl.insertAdjacentElement) afterEl.insertAdjacentElement('afterend', btn); else if(anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', btn); else wrapEl.insertBefore(btn, wrapEl.firstChild); }
    if(!document.getElementById('c-add')){
      var b1=document.createElement('button'); b1.id='c-add'; b1.type='button'; b1.className='c-addbtn'; b1.textContent=L('add');
      place(b1, null);
      b1.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
    if(!document.getElementById('c-addcollap')){
      var b3=document.createElement('button'); b3.id='c-addcollap'; b3.type='button'; b3.className='c-addbtn'; b3.textContent=L('addcollap');
      place(b3, document.getElementById('c-add'));
      b3.addEventListener('click', function(){ var cid=pageKey+'#add-'+Date.now(); DATA[cid]={cid:cid,added:true,type:'collapsible',t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
    // „Kachel → Seite" nur auf der Entry-Seite (index), nicht in der 2. Ebene
    if(pageKey==='index' && !document.getElementById('c-addpage')){
      var b2=document.createElement('button'); b2.id='c-addpage'; b2.type='button'; b2.className='c-addbtn'; b2.textContent=L('addpage');
      place(b2, document.getElementById('c-addcollap')||document.getElementById('c-add'));
      b2.addEventListener('click', function(){ var tgt='page-'+Date.now(), cid=pageKey+'#'+tgt;
        DATA[cid]={cid:cid,type:'pagelink',target:tgt,t_orig:'',t_de:'',t_en:'',t_tr:'',t_ru:''}; render();
        var el=document.querySelector('[data-cid="'+cssq(cid)+'"]'); if(el) openEditor(el); });
    }
  }

  function openEditor(el){
    if(el.querySelector('.c-editor')) return;
    var cid=el.getAttribute('data-cid'), doc=DATA[cid];
    var start = doc ? (doc.t_orig||pick(doc)) : extractCurrentText(el);
    // Original-Inhalt verstecken (außer Werkzeugleiste)
    var hidden=[];
    Array.prototype.forEach.call(el.children, function(c){ if(!c.classList.contains('c-bar')){ hidden.push(c); c.style.display='none'; } });
    // Navigations-Kachel: Link-Klick während des Editierens unterbinden
    var aNav=el.closest('a.cardlink'), navBlock=function(e){ e.preventDefault(); };
    if(aNav) aNav.addEventListener('click', navBlock, true);
    function unblock(){ if(aNav) aNav.removeEventListener('click', navBlock, true); }
    var isLink = !!(doc && doc.type==='pagelink');
    var isCollap = !!(doc && doc.type==='collapsible');
    var isStrat = !isLink && !isCollap && /allianzduell|powerplay|stadtduell|reservoir|ghuloewe|ehren|event|strat/i.test(pageKey);
    var box=document.createElement('div'); box.className='c-editor';
    box.innerHTML=(isStrat?'<p class="c-warn">'+L('warn')+'</p>':'')+
      (isLink?'':'<div class="c-fmt"><button type="button" data-md="h1" title="'+L('fH1')+'">H1</button><button type="button" data-md="h2" title="'+L('fH2')+'">H2</button><button type="button" data-md="bold" title="'+L('fBold')+'"><b>B</b></button><button type="button" data-md="ul" title="'+L('fList')+'">• '+L('fList')+'</button><button type="button" data-emo="⚔️">⚔️</button><button type="button" data-emo="💧">💧</button><button type="button" data-emo="✅">✅</button><button type="button" data-emo="⛔">⛔</button><button type="button" data-emo="📍">📍</button><button type="button" data-emo="💡">💡</button><button type="button" data-emo="🟡">🟡</button><button type="button" data-emo="🟠">🟠</button><button type="button" data-emo="🔴">🔴</button><button type="button" data-emo="🔵">🔵</button></div>')+
      '<textarea class="c-ta" rows="'+(isLink?2:6)+'" placeholder="'+(isLink?L('phPage'):(isCollap?L('phCollap'):''))+'">'+esc(start)+'</textarea>'+
      '<div class="c-note">'+(isLink?L('notePage'):(isCollap?L('noteCollap'):L('noteText')))+'</div>'+
      (isLink?'':'<div class="c-imgrow"><label>'+L('img')+' <input type="file" class="c-img" accept="image/*"></label> <span class="c-imgcur"></span><div class="c-note">'+L('imgnote')+'</div></div>')+
      '<div class="c-row"><button type="button" class="c-save">'+L('save')+'</button><button type="button" class="c-cancel">'+L('cancel')+'</button><span class="c-msg"></span></div>';
    el.appendChild(box);
    if(!isLink && doc && doc.img){ var cur=box.querySelector('.c-imgcur'); if(cur) cur.innerHTML='<img src="'+doc.img+'" style="max-height:60px;border-radius:6px;vertical-align:middle"> <label style="font-size:.85rem"><input type="checkbox" class="c-imgdel"> '+L('imgdel')+'</label>'; }
    if(isDetails(el)) el.open=true;   // aufklappen, damit der Editor sichtbar ist
    var ta=box.querySelector('.c-ta'); ta.focus();
    var fmt=box.querySelector('.c-fmt');
    if(fmt) fmt.addEventListener('click', function(e){ var b=e.target.closest('button'); if(!b) return; e.preventDefault();
      var k=b.getAttribute('data-md'), em=b.getAttribute('data-emo');
      if(em) taInsert(ta,em);
      else if(k==='bold') taWrap(ta,'**','**');
      else if(k==='h1') taLinePrefix(ta,'# ');
      else if(k==='h2') taLinePrefix(ta,'## ');
      else if(k==='ul') taLinePrefix(ta,'- ');
    });
    /* Enter in einer Aufzählung -> nächste Zeile automatisch mit „- "; leerer Punkt beendet die Liste. */
    ta.addEventListener('keydown', function(ev){
      if(ev.key!=='Enter') return;
      var v=ta.value, s=ta.selectionStart, ls=v.lastIndexOf('\n',s-1)+1, line=v.slice(ls,s), m=line.match(/^(\s*[-*]\s+)/);
      if(!m) return; ev.preventDefault();
      if(line.trim()===m[1].trim()){ ta.value=v.slice(0,ls)+v.slice(s); ta.selectionStart=ta.selectionEnd=ls; }
      else { var ins='\n'+m[1]; ta.value=v.slice(0,s)+ins+v.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+ins.length; }
    });
    function restore(){ unblock(); box.remove(); hidden.forEach(function(c){ c.style.display=''; }); }
    box.querySelector('.c-cancel').addEventListener('click', function(){ restore();
      if(doc && doc.added && !doc.t_orig){ delete DATA[cid]; if(!el.getAttribute('data-cid').match(/#\d+$/)) el.remove(); } });
    box.querySelector('.c-save').addEventListener('click', function(){
      var text=ta.value.trim(), msg=box.querySelector('.c-msg'), btn=box.querySelector('.c-save');
      if(!text){ msg.textContent=L('needtext'); return; }
      btn.disabled=true; msg.textContent=L('translating');
      translate(text, function(tr){
        var prev=DATA[cid]||{};
        var nd={ cid:cid, t_orig:text, orig_lang:curLang(), editor:editorName(), tms:Date.now(),
                 t_de:(tr&&tr.de)||'', t_en:(tr&&tr.en)||'', t_tr:(tr&&tr.tr)||'', t_ru:(tr&&tr.ru)||'',
                 prev_orig:prev.t_orig||'', prev_lang:prev.orig_lang||'', prev_editor:prev.editor||'', prev_tms:prev.tms||0 };
        if(prev.added) nd.added=true;
        if(prev.type){ nd.type=prev.type; if(prev.target!=null) nd.target=prev.target; }   // type erhalten (Seiten-Kachel: auch target)
        if(!(tr&&(tr.de||tr.en||tr.tr||tr.ru))) nd['t_'+curLang()]=text;  // Worker aus -> Original übernehmen
        function finalize(imgVal){
          if(imgVal){ nd.img=imgVal; } else if(prev.img){ nd.img=''; }   // Bild setzen / entfernen / weglassen
          save(cid, nd, function(ok){ if(ok){ unblock(); } else { btn.disabled=false; msg.textContent=L('saveerr'); } });
        }
        var fi=box.querySelector('.c-img'), file=fi?fi.files[0]:null, del=box.querySelector('.c-imgdel');
        if(file){ msg.textContent=L('shrinking'); shrinkImage(file, function(d){ if(d && d.length>900000){ btn.disabled=false; msg.textContent=L('toobig'); return; } finalize(d||''); }); }
        else { finalize((del&&del.checked)?'':(prev.img||'')); }
      });
    });
  }

  function removeTile(el){
    var cid=el.getAttribute('data-cid'), prev=DATA[cid]||{};
    if(!confirm(L('confirmDel'))) return;
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
    else { cb(true); }
  }

  function loadScript(src,cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; s.onerror=cb; document.head.appendChild(s); }
  function initFb(done){
    if(typeof firebase!=='undefined') return done();
    loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",function(){
      loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js",done); });
  }
  function boot(){
    prepare(); render(); addButton();
    document.addEventListener('s1l:lang', function(){ render(); relabelBtns(); });   // doc-Kacheln + R4-Buttons in neuer Sprache; Rest macht lang.js
    initFb(function(){ try{ if(typeof firebase!=='undefined'){ if(!firebase.apps.length) firebase.initializeApp(FB);
      col=firebase.firestore().collection('content');
      col.onSnapshot(function(s){ DATA={}; s.forEach(function(d){ DATA[d.id]=d.data()||{}; }); render(); addButton(); },
        function(){ col=null; }); } }catch(e){ col=null; } });
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
